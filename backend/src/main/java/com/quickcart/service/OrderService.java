package com.quickcart.service;

import com.quickcart.dto.*;
import com.quickcart.entity.*;
import com.quickcart.event.DomainEventPublisher;
import com.quickcart.event.OrderEvents;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.logging.StructuredAuditLogger;
import com.quickcart.repository.*;
import com.quickcart.service.order.OrderDtoMapper;
import com.quickcart.service.order.OrderLifecycleHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enterprise Transactional Order Service.
 * Orchestrates checkout processing, stock reservations, idempotent replaying, and order queries.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final AddressRepository addressRepository;
    private final PaymentRepository paymentRepository;
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final CartService cartService;
    private final AuthService authService;
    private final OrderTrackingWebSocketService webSocketService;
    private final WalletService walletService;
    private final InventoryService inventoryService;
    private final PricingService pricingService;
    private final StoreFulfillmentService storeFulfillmentService;
    private final OrderStateHistoryRepository orderStateHistoryRepository;
    private final DomainEventPublisher domainEventPublisher;
    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final OrderDtoMapper orderDtoMapper;
    private final OrderLifecycleHandler orderLifecycleHandler;
    private final StructuredAuditLogger auditLogger;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        if (currentUser == null) {
            throw new BadRequestException("User must be authenticated to place an order");
        }

        // 1. Idempotency Replay Check
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            Optional<IdempotencyKey> existingKey = idempotencyKeyRepository.findByIdempotencyKeyAndUserId(
                    request.getIdempotencyKey().trim(), currentUser.getId());
            if (existingKey.isPresent()) {
                log.info("Idempotent checkout replay detected for key: {}", request.getIdempotencyKey());
                Optional<Order> matchedOrder = orderRepository.findAll().stream()
                        .filter(o -> request.getIdempotencyKey().trim().equals(o.getIdempotencyKey()))
                        .findFirst();
                if (matchedOrder.isPresent()) {
                    return orderDtoMapper.mapToDto(matchedOrder.get());
                }
            }
        }

        Cart cart = cartService.getOrCreateUserCart(currentUser);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty. Please add products to place an order.");
        }

        Address address = addressRepository.findByIdAndUserId(request.getAddressId(), currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + request.getAddressId()));

        DarkStore store = storeFulfillmentService.selectOptimalStore(address.getLatitude(), address.getLongitude(), cart.getItems());
        Long storeId = store != null ? store.getId() : null;
        if (storeId != null) {
            storeFulfillmentService.adjustStoreLoad(storeId, 1);
        }

        Coupon coupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            coupon = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(request.getCouponCode().trim()).orElse(null);
        }

        // 2. Authoritative Server-Side Pricing Engine
        PricingCalculation pricing = pricingService.calculate(cart.getItems(), coupon, request.getWalletAmountToRedeem());
        BigDecimal tipAmount = request.getTipAmount() != null ? request.getTipAmount().max(BigDecimal.ZERO) : BigDecimal.ZERO;
        BigDecimal finalTotal = pricing.getFinalPayableAmount().add(tipAmount);
        String orderNumber = "QC" + System.currentTimeMillis() % 100000000;

        // Apply QuickCash Wallet deduction
        BigDecimal walletDeduction = pricing.getWalletDiscount();
        if (walletDeduction.compareTo(BigDecimal.ZERO) > 0) {
            walletService.debitForOrder(currentUser, walletDeduction, orderNumber);
        }

        // 3. Transactional Stock Reservation
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            inventoryService.reserveStockForOrder(storeId, product.getId(), item.getQuantity(), orderNumber);
        }

        // Record Coupon Usage
        if (coupon != null && pricing.getCouponDiscount().compareTo(BigDecimal.ZERO) > 0) {
            coupon.setTimesUsed(coupon.getTimesUsed() + 1);
            couponRepository.save(coupon);
            couponUsageRepository.save(CouponUsage.builder()
                    .coupon(coupon)
                    .user(currentUser)
                    .orderNumber(orderNumber)
                    .discountApplied(pricing.getCouponDiscount())
                    .build());
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
            orderItems.add(new OrderItem(savedOrder, product, product.getName(), product.getImageUrl(),
                    product.getUnitQuantity(), item.getQuantity(), product.getSellingPrice(), lineTotal));
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

        // Assign available Delivery Partner
        List<DeliveryPartner> availablePartners = deliveryPartnerRepository.findByIsAvailableTrue();
        if (!availablePartners.isEmpty()) {
            DeliveryAssignment assignment = new DeliveryAssignment(savedOrder, availablePartners.get(0));
            deliveryAssignmentRepository.save(assignment);
            savedOrder.setDeliveryAssignment(assignment);
        }

        // Save idempotency key record
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            idempotencyKeyRepository.save(IdempotencyKey.builder()
                    .idempotencyKey(request.getIdempotencyKey().trim())
                    .userId(currentUser.getId())
                    .requestHash(String.valueOf(request.hashCode()))
                    .statusCode(200)
                    .expiresAt(LocalDateTime.now().plusHours(24))
                    .build());
        }

        cartService.clearCart(currentUser);

        orderStateHistoryRepository.save(OrderStateHistory.builder()
                .order(savedOrder)
                .fromStatus(null)
                .toStatus(savedOrder.getStatus())
                .actor(currentUser.getEmail())
                .reason("Order placed successfully")
                .build());

        OrderResponse response = orderDtoMapper.mapToDto(savedOrder);

        // Publish Domain Events & Real-time WebSocket broadcasts
        domainEventPublisher.publish(OrderEvents.OrderCreatedEvent.builder()
                .orderId(savedOrder.getId())
                .orderNumber(orderNumber)
                .customerId(currentUser.getId())
                .customerEmail(currentUser.getEmail())
                .totalAmount(finalTotal)
                .paymentMethod(request.getPaymentMethod().name())
                .itemCount(orderItems.size())
                .build());

        webSocketService.broadcastOrderStatusUpdate(response);
        auditLogger.logEvent("ORDER_LIFECYCLE", "ORDER_CREATED", "SUCCESS", Map.of(
                "orderNumber", orderNumber,
                "amount", finalTotal,
                "customerId", currentUser.getId()
        ));

        return response;
    }

    public List<OrderResponse> getUserOrders() {
        User currentUser = authService.getCurrentUserEntity();
        return orderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(orderDtoMapper::mapToDto)
                .collect(Collectors.toList());
    }

    public Page<OrderResponse> getUserOrdersPaged(int page, int size) {
        User currentUser = authService.getCurrentUserEntity();
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId(), pageable)
                .map(orderDtoMapper::mapToDto);
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

        return orderDtoMapper.mapToDto(order);
    }

    public List<OrderResponse> getAllOrdersAdmin() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(orderDtoMapper::mapToDto)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with order number: " + orderNumber));
        return orderDtoMapper.mapToDto(order);
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

        if (newStatus == OrderStatus.DELIVERED) {
            orderLifecycleHandler.handleDelivered(order);
        } else if (newStatus == OrderStatus.CANCELLED) {
            orderLifecycleHandler.handleCancelled(order);
        }

        Order updatedOrder = orderRepository.save(order);
        OrderResponse response = orderDtoMapper.mapToDto(updatedOrder);

        String actor = "SYSTEM";
        try {
            if (authService.getCurrentAuthenticatedUser() != null) {
                actor = authService.getCurrentAuthenticatedUser().getUsername();
            }
        } catch (Exception _e) {
            // Keep default SYSTEM actor
        }

        orderLifecycleHandler.recordTransition(updatedOrder, oldStatus, newStatus, actor, response);
        log.info("Order #{} state transitioned from {} to {}", order.getOrderNumber(), oldStatus, newStatus);
        return response;
    }

    public List<OrderStateHistoryDto> getOrderTimeline(Long orderId) {
        return orderStateHistoryRepository.findByOrderIdOrderByCreatedAtAsc(orderId).stream()
                .map(h -> OrderStateHistoryDto.builder()
                        .id(h.getId())
                        .orderId(h.getOrder().getId())
                        .orderNumber(h.getOrder().getOrderNumber())
                        .fromStatus(h.getFromStatus())
                        .toStatus(h.getToStatus())
                        .actor(h.getActor())
                        .reason(h.getReason())
                        .createdAt(h.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
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
        return orderDtoMapper.mapToDto(order);
    }
}
