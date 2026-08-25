package com.quickcart.service;

import com.quickcart.dto.*;
import com.quickcart.entity.*;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final DarkStoreRepository darkStoreRepository;
    private final CartService cartService;
    private final CouponService couponService;
    private final AuthService authService;
    private final OrderTrackingWebSocketService webSocketService;
    private final WalletService walletService;
    private final InventoryService inventoryService;
    private final NotificationService notificationService;
    private final PaymentGatewayService paymentGatewayService;
    private final PricingService pricingService;
    private final com.quickcart.event.DomainEventPublisher domainEventPublisher;
    private final IdempotencyKeyRepository idempotencyKeyRepository;

    @Value("${quickcart.app.freeDeliveryThreshold:199.0}")
    private double freeDeliveryThreshold;

    @Value("${quickcart.app.baseDeliveryFee:25.0}")
    private double baseDeliveryFee;

    @Value("${quickcart.app.platformFee:5.0}")
    private double platformFee;

    @Value("${quickcart.app.taxRate:0.05}")
    private double taxRate;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        if (currentUser == null) {
            throw new BadRequestException("User must be authenticated to place an order");
        }

        // 1. Idempotency Check
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            Optional<IdempotencyKey> existingKey = idempotencyKeyRepository.findByIdempotencyKeyAndUserId(
                    request.getIdempotencyKey().trim(), currentUser.getId());
            if (existingKey.isPresent()) {
                log.info("Idempotent checkout replay detected for key: {}", request.getIdempotencyKey());
                Optional<Order> matchedOrder = orderRepository.findAll().stream()
                        .filter(o -> request.getIdempotencyKey().trim().equals(o.getIdempotencyKey()))
                        .findFirst();
                if (matchedOrder.isPresent()) {
                    return mapToDto(matchedOrder.get());
                }
            }
        }

        Cart cart = cartService.getOrCreateUserCart(currentUser);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty. Please add products to place an order.");
        }

        Address address = addressRepository.findByIdAndUserId(request.getAddressId(), currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + request.getAddressId()));

        // Assign nearest active dark store
        DarkStore store = darkStoreRepository.findByIsActiveTrue().stream().findFirst().orElse(null);
        Long storeId = store != null ? store.getId() : null;

        // Validate active promo coupon if provided
        Coupon coupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            coupon = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(request.getCouponCode().trim()).orElse(null);
        }

        // 2. Authoritative Server-Side Pricing Engine
        PricingCalculation pricing = pricingService.calculate(cart.getItems(), coupon, request.getWalletAmountToRedeem());

        BigDecimal tipAmount = request.getTipAmount() != null ? request.getTipAmount().max(BigDecimal.ZERO) : BigDecimal.ZERO;
        BigDecimal finalTotal = pricing.getFinalPayableAmount().add(tipAmount);

        // Generate Order Number
        String orderNumber = "QC" + System.currentTimeMillis() % 100000000;

        // Apply QuickCash Wallet points deduction if calculated
        BigDecimal walletDeduction = pricing.getWalletDiscount();
        if (walletDeduction.compareTo(BigDecimal.ZERO) > 0) {
            walletService.debitForOrder(currentUser, walletDeduction, orderNumber);
        }

        // 3. Transactional Stock Reservation with Pessimistic Locking
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            inventoryService.reserveStockForOrder(storeId, product.getId(), item.getQuantity(), orderNumber);
        }

        // Record Coupon Usage
        if (coupon != null && pricing.getCouponDiscount().compareTo(BigDecimal.ZERO) > 0) {
            coupon.setTimesUsed(coupon.getTimesUsed() + 1);
            couponRepository.save(coupon);

            CouponUsage usage = CouponUsage.builder()
                    .coupon(coupon)
                    .user(currentUser)
                    .orderNumber(orderNumber)
                    .discountApplied(pricing.getCouponDiscount())
                    .build();
            couponUsageRepository.save(usage);
        }

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(currentUser)
                .address(address)
                .store(store)
                .status(OrderStatus.CONFIRMED)
                .itemTotal(pricing.getItemSubtotal())
                .deliveryFee(pricing.getDeliveryFee())
                .platformFee(pricing.getPlatformFee())
                .taxAmount(pricing.getTaxAmount())
                .discountAmount(pricing.getCouponDiscount())
                .walletDiscountAmount(walletDeduction)
                .tipAmount(tipAmount)
                .totalAmount(finalTotal)
                .couponCode(pricing.getAppliedCouponCode())
                .deliveryInstructions(request.getDeliveryInstructions())
                .idempotencyKey(request.getIdempotencyKey())
                .estimatedDeliveryTime(LocalDateTime.now().plusMinutes(15 + (long)(Math.random() * 10)))
                .build();

        Order savedOrder = orderRepository.save(order);

        // Create Order Items
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            BigDecimal lineTotal = product.getSellingPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            OrderItem orderItem = new OrderItem(
                    savedOrder,
                    product,
                    product.getName(),
                    product.getImageUrl(),
                    product.getUnitQuantity(),
                    item.getQuantity(),
                    product.getSellingPrice(),
                    lineTotal
            );
            orderItems.add(orderItem);
        }
        orderItemRepository.saveAll(orderItems);
        savedOrder.setItems(orderItems);

        // Create Payment record
        Payment payment = Payment.builder()
                .order(savedOrder)
                .transactionId("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(request.getPaymentMethod() == PaymentMethod.CASH_ON_DELIVERY ? PaymentStatus.PENDING : PaymentStatus.COMPLETED)
                .amount(finalTotal)
                .currency("INR")
                .build();
        paymentRepository.save(payment);
        savedOrder.setPayment(payment);

        // Assign available Delivery Partner if one exists
        List<DeliveryPartner> availablePartners = deliveryPartnerRepository.findByIsAvailableTrue();
        if (!availablePartners.isEmpty()) {
            DeliveryPartner partner = availablePartners.get(0);
            DeliveryAssignment assignment = new DeliveryAssignment(savedOrder, partner);
            deliveryAssignmentRepository.save(assignment);
            savedOrder.setDeliveryAssignment(assignment);
        }

        // Save idempotency key record if present
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            idempotencyKeyRepository.save(IdempotencyKey.builder()
                    .idempotencyKey(request.getIdempotencyKey().trim())
                    .userId(currentUser.getId())
                    .requestHash(String.valueOf(request.hashCode()))
                    .statusCode(200)
                    .expiresAt(LocalDateTime.now().plusHours(24))
                    .build());
        }

        // Clear user cart
        cartService.clearCart(currentUser);

        OrderResponse response = mapToDto(savedOrder);

        // 4. Publish Domain Events & Real-time notifications
        domainEventPublisher.publish(com.quickcart.event.OrderEvents.OrderCreatedEvent.builder()
                .orderId(savedOrder.getId())
                .orderNumber(orderNumber)
                .customerId(currentUser.getId())
                .customerEmail(currentUser.getEmail())
                .totalAmount(finalTotal)
                .paymentMethod(request.getPaymentMethod().name())
                .itemCount(orderItems.size())
                .build());

        // Broadcast new order creation via WebSocket
        webSocketService.broadcastOrderStatusUpdate(response);

        return response;
    }

    public List<OrderResponse> getUserOrders() {
        User currentUser = authService.getCurrentUserEntity();
        return orderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public Page<OrderResponse> getUserOrdersPaged(int page, int size) {
        User currentUser = authService.getCurrentUserEntity();
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId(), pageable)
                .map(this::mapToDto);
    }

    public OrderResponse getOrderById(Long id) {
        User currentUser = authService.getCurrentUserEntity();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        boolean isAuthorized = order.getUser().getId().equals(currentUser.getId()) ||
                currentUser.getRoles().stream().anyMatch(r ->
                        r.getName() == ERole.ROLE_ADMIN ||
                        r.getName() == ERole.ROLE_STORE_MANAGER ||
                        r.getName() == ERole.ROLE_DELIVERY_PARTNER);

        if (!isAuthorized) {
            throw new BadRequestException("Unauthorized access to this order.");
        }

        return mapToDto(order);
    }

    public List<OrderResponse> getAllOrdersAdmin() {
        return orderRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with order number: " + orderNumber));
        return mapToDto(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        OrderStatus oldStatus = order.getStatus();
        if (oldStatus != null && !oldStatus.canTransitionTo(newStatus)) {
            throw new BadRequestException("Illegal order state transition from " + oldStatus + " to " + newStatus);
        }

        order.setStatus(newStatus);
        Long storeId = order.getStore() != null ? order.getStore().getId() : null;

        if (newStatus == OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
            if (order.getPayment() != null) {
                order.getPayment().setPaymentStatus(PaymentStatus.COMPLETED);
            }
            if (order.getDeliveryAssignment() != null) {
                order.getDeliveryAssignment().setStatus("DELIVERED");
                order.getDeliveryAssignment().setDeliveredAt(LocalDateTime.now());
            }

            // Commit deduction for inventory
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    inventoryService.commitDeductionForOrder(storeId, item.getProduct().getId(), item.getQuantity(), order.getOrderNumber());
                }
            }

            // Credit 5% loyalty cashback to customer wallet
            walletService.creditCashbackForOrder(order.getUser(), order);

            domainEventPublisher.publish(com.quickcart.event.OrderEvents.OrderDeliveredEvent.builder()
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .customerId(order.getUser().getId())
                    .partnerId(order.getDeliveryAssignment() != null && order.getDeliveryAssignment().getPartner() != null ? order.getDeliveryAssignment().getPartner().getId() : null)
                    .build());

            notificationService.createNotification(
                    order.getUser().getId(),
                    "Order Delivered!",
                    "Order #" + order.getOrderNumber() + " was delivered. Enjoy your groceries!",
                    "ORDER",
                    order.getOrderNumber()
            );
        } else if (newStatus == OrderStatus.CANCELLED) {
            // Restore product stock and release inventory reservation
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    inventoryService.releaseReservedStock(storeId, item.getProduct().getId(), item.getQuantity(), order.getOrderNumber());
                    Product p = item.getProduct();
                    p.setStockQuantity(p.getStockQuantity() + item.getQuantity());
                    productRepository.save(p);
                }
            }

            // Refund wallet deduction if any
            if (order.getWalletDiscountAmount() != null && order.getWalletDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                walletService.refundForOrder(order.getUser(), order.getWalletDiscountAmount(), order.getOrderNumber());
            }

            // Refund payment if paid via online gateway
            if (order.getPayment() != null && order.getPayment().getPaymentStatus() == PaymentStatus.COMPLETED) {
                paymentGatewayService.initiateRefund(order.getOrderNumber(), order.getTotalAmount(), "Order cancelled");
            }

            if (order.getDeliveryAssignment() != null) {
                order.getDeliveryAssignment().setStatus("CANCELLED");
            }

            notificationService.createNotification(
                    order.getUser().getId(),
                    "Order Cancelled",
                    "Order #" + order.getOrderNumber() + " has been cancelled.",
                    "ORDER",
                    order.getOrderNumber()
            );
        }

        Order updatedOrder = orderRepository.save(order);
        OrderResponse response = mapToDto(updatedOrder);

        // Broadcast order status change
        webSocketService.broadcastOrderStatusUpdate(response);

        log.info("Order #{} state transitioned from {} to {}", order.getOrderNumber(), oldStatus, newStatus);
        return response;
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        return cancelOrder(orderId, "Cancelled by user");
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, String reason) {
        User currentUser = authService.getCurrentUserEntity();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(currentUser.getId()) &&
                currentUser.getRoles().stream().noneMatch(r -> r.getName() == ERole.ROLE_ADMIN)) {
            throw new BadRequestException("Unauthorized to cancel this order.");
        }

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {
            throw new BadRequestException("Order cannot be cancelled in status: " + order.getStatus());
        }

        return updateOrderStatus(orderId, OrderStatus.CANCELLED);
    }

    public OrderResponse mapToDto(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getProduct() != null ? item.getProduct().getId() : null,
                        item.getProductName(),
                        item.getProductImage(),
                        item.getUnitQuantity(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getTotalPrice()
                ))
                .collect(Collectors.toList());

        AddressDto addressDto = null;
        if (order.getAddress() != null) {
            Address a = order.getAddress();
            addressDto = new AddressDto(
                    a.getId(), a.getLabel(), a.getReceiverName(), a.getReceiverPhone(),
                    a.getStreetAddress(), a.getApartmentUnit(), a.getLandmark(),
                    a.getCity(), a.getState(), a.getPincode(), a.getLatitude(),
                    a.getLongitude(), a.getIsDefault()
            );
        }

        PaymentResponseDto paymentDto = null;
        if (order.getPayment() != null) {
            Payment p = order.getPayment();
            paymentDto = PaymentResponseDto.builder()
                    .id(p.getId())
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .transactionId(p.getTransactionId())
                    .paymentMethod(p.getPaymentMethod())
                    .paymentStatus(p.getPaymentStatus())
                    .amount(p.getAmount())
                    .currency(p.getCurrency())
                    .createdAt(p.getCreatedAt())
                    .build();
        }

        BigDecimal cashbackEarned = order.getItemTotal().multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus(),
                order.getItemTotal(),
                order.getDeliveryFee(),
                order.getPlatformFee(),
                order.getTaxAmount(),
                order.getDiscountAmount(),
                order.getWalletDiscountAmount() != null ? order.getWalletDiscountAmount() : BigDecimal.ZERO,
                cashbackEarned,
                order.getTipAmount(),
                order.getTotalAmount(),
                order.getCouponCode(),
                order.getDeliveryInstructions(),
                order.getEstimatedDeliveryTime(),
                order.getDeliveredAt(),
                itemResponses,
                addressDto,
                paymentDto,
                order.getCreatedAt()
        );
    }
}
