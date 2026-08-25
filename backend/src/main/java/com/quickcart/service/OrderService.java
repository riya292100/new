package com.quickcart.service;

import com.quickcart.dto.*;
import com.quickcart.entity.*;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.*;
import lombok.RequiredArgsConstructor;
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
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final CouponRepository couponRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final CartService cartService;
    private final CouponService couponService;
    private final AuthService authService;
    private final AddressService addressService;
    private final OrderTrackingWebSocketService webSocketService;
    private final WalletService walletService;

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
        User currentUser = authService.getCurrentAuthenticatedUser();
        Cart cart = cartService.getOrCreateUserCart(currentUser);

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty. Please add products to place an order.");
        }

        Address address = addressRepository.findByIdAndUserId(request.getAddressId(), currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + request.getAddressId()));

        // Validate stock for all items
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName() +
                        ". Available: " + product.getStockQuantity() + ", Requested: " + item.getQuantity());
            }
        }

        // Calculate totals
        BigDecimal itemTotal = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            BigDecimal subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            itemTotal = itemTotal.add(subtotal);
        }

        BigDecimal deliveryFee = BigDecimal.ZERO;
        if (itemTotal.compareTo(BigDecimal.valueOf(freeDeliveryThreshold)) < 0) {
            deliveryFee = BigDecimal.valueOf(baseDeliveryFee);
        }

        BigDecimal platformFeeAmount = BigDecimal.valueOf(platformFee);
        BigDecimal taxAmount = itemTotal.multiply(BigDecimal.valueOf(taxRate)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal discountAmount = BigDecimal.ZERO;
        String couponCode = null;

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            CouponValidationResponse couponResp = couponService.validateCoupon(
                    new CouponValidationRequest(request.getCouponCode(), itemTotal));
            if (couponResp.getIsValid()) {
                discountAmount = couponResp.getDiscountAmount();
                couponCode = couponResp.getCode();

                // Increment coupon usage
                couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(couponCode).ifPresent(c -> {
                    c.setTimesUsed(c.getTimesUsed() + 1);
                    couponRepository.save(c);
                });
            }
        }

        BigDecimal tipAmount = request.getTipAmount() != null ? request.getTipAmount() : BigDecimal.ZERO;
        BigDecimal preWalletTotal = itemTotal.add(deliveryFee).add(platformFeeAmount).add(taxAmount)
                .add(tipAmount).subtract(discountAmount);

        if (preWalletTotal.compareTo(BigDecimal.ZERO) < 0) {
            preWalletTotal = BigDecimal.ZERO;
        }

        // Generate Order Number
        String orderNumber = "QC" + System.currentTimeMillis() % 100000000;

        // Apply QuickCash Wallet points if requested
        BigDecimal walletDiscountAmount = BigDecimal.ZERO;
        if (request.getWalletAmountToRedeem() != null && request.getWalletAmountToRedeem().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal maxUsable = preWalletTotal;
            BigDecimal requestedRedeem = request.getWalletAmountToRedeem().min(maxUsable);
            walletDiscountAmount = walletService.debitForOrder(currentUser, requestedRedeem, orderNumber);
        }

        BigDecimal totalAmount = preWalletTotal.subtract(walletDiscountAmount).max(BigDecimal.ZERO);

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setUser(currentUser);
        order.setAddress(address);
        order.setStatus(OrderStatus.ORDER_PLACED);
        order.setItemTotal(itemTotal);
        order.setDeliveryFee(deliveryFee);
        order.setPlatformFee(platformFeeAmount);
        order.setTaxAmount(taxAmount);
        order.setDiscountAmount(discountAmount);
        order.setWalletDiscountAmount(walletDiscountAmount);
        order.setTipAmount(tipAmount);
        order.setTotalAmount(totalAmount);
        order.setCouponCode(couponCode);
        order.setDeliveryInstructions(request.getDeliveryInstructions());
        order.setEstimatedDeliveryTime(LocalDateTime.now().plusMinutes(15 + (long)(Math.random() * 10)));

        Order savedOrder = orderRepository.save(order);

        // Deduct product stock & create OrderItems
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);

            BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            OrderItem orderItem = new OrderItem(
                    savedOrder,
                    product,
                    product.getName(),
                    product.getImageUrl(),
                    product.getUnitQuantity(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    lineTotal
            );
            orderItems.add(orderItem);
        }
        orderItemRepository.saveAll(orderItems);
        savedOrder.setItems(orderItems);

        // Create Payment record
        Payment payment = new Payment();
        payment.setOrder(savedOrder);
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentStatus(request.getPaymentMethod() == PaymentMethod.CASH_ON_DELIVERY ? PaymentStatus.PENDING : PaymentStatus.COMPLETED);
        payment.setAmount(totalAmount);
        payment.setCurrency("INR");
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

        // Clear user cart
        cartService.clearCart(currentUser);

        OrderResponse response = mapToDto(savedOrder);

        // Broadcast new order creation via WebSocket
        webSocketService.broadcastOrderStatusUpdate(response);

        return response;
    }

    public List<OrderResponse> getUserOrders() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return orderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public Page<OrderResponse> getUserOrdersPaged(int page, int size) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId(), pageable)
                .map(this::mapToDto);
    }

    public OrderResponse getOrderById(Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        boolean isAuthorized = order.getUser().getId().equals(currentUser.getId()) ||
                currentUser.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_ADMIN || r.getName() == ERole.ROLE_DELIVERY_PARTNER);

        if (!isAuthorized) {
            throw new BadRequestException("Unauthorized access to this order.");
        }

        return mapToDto(order);
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

        order.setStatus(newStatus);
        if (newStatus == OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
            if (order.getPayment() != null) {
                order.getPayment().setPaymentStatus(PaymentStatus.COMPLETED);
            }
            if (order.getDeliveryAssignment() != null) {
                order.getDeliveryAssignment().setStatus("DELIVERED");
                order.getDeliveryAssignment().setDeliveredAt(LocalDateTime.now());
                DeliveryPartner partner = order.getDeliveryAssignment().getPartner();
                if (partner != null) {
                    partner.setTotalDeliveries(partner.getTotalDeliveries() + 1);
                    deliveryPartnerRepository.save(partner);
                }
            }
            // Auto credit 5% cashback to user wallet
            walletService.creditCashbackForOrder(order.getUser(), order);
        }

        Order saved = orderRepository.save(order);
        OrderResponse response = mapToDto(saved);

        // Broadcast to live client WebSocket subscribers
        webSocketService.broadcastOrderStatusUpdate(response);

        return response;
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(currentUser.getId()) &&
                currentUser.getRoles().stream().noneMatch(r -> r.getName() == ERole.ROLE_ADMIN)) {
            throw new BadRequestException("Unauthorized to cancel this order.");
        }

        if (order.getStatus() == OrderStatus.OUT_FOR_DELIVERY || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Cannot cancel order once it is out for delivery or delivered.");
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Restore inventory
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                if (product != null) {
                    product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                    productRepository.save(product);
                }
            }
        }

        if (order.getPayment() != null && order.getPayment().getPaymentStatus() == PaymentStatus.COMPLETED) {
            order.getPayment().setPaymentStatus(PaymentStatus.REFUNDED);
        }

        // Refund wallet credits if used
        if (order.getWalletDiscountAmount() != null && order.getWalletDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            walletService.refundForOrder(order.getUser(), order.getWalletDiscountAmount(), order.getOrderNumber());
        }

        Order saved = orderRepository.save(order);
        OrderResponse response = mapToDto(saved);
        webSocketService.broadcastOrderStatusUpdate(response);

        return response;
    }

    public List<OrderResponse> getAllOrdersAdmin() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public OrderResponse mapToDto(Order order) {
        List<OrderItemResponse> itemDtos = order.getItems() != null
                ? order.getItems().stream().map(i -> new OrderItemResponse(
                i.getId(),
                i.getProduct() != null ? i.getProduct().getId() : null,
                i.getProductName(),
                i.getProductImage(),
                i.getUnitQuantity(),
                i.getQuantity(),
                i.getUnitPrice(),
                i.getTotalPrice()
        )).collect(Collectors.toList())
                : new ArrayList<>();

        DeliveryPartner partner = order.getDeliveryAssignment() != null
                ? order.getDeliveryAssignment().getPartner()
                : null;

        BigDecimal cashback = order.getItemTotal() != null
                ? order.getItemTotal().multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getUser().getId(),
                order.getUser().getFullName(),
                order.getUser().getPhone(),
                order.getAddress() != null ? addressService.mapToDto(order.getAddress()) : null,
                order.getStatus(),
                order.getItemTotal(),
                order.getDeliveryFee(),
                order.getPlatformFee(),
                order.getTaxAmount(),
                order.getDiscountAmount(),
                order.getWalletDiscountAmount() != null ? order.getWalletDiscountAmount() : BigDecimal.ZERO,
                cashback,
                order.getTipAmount(),
                order.getTotalAmount(),
                order.getCouponCode(),
                order.getDeliveryInstructions(),
                order.getEstimatedDeliveryTime(),
                order.getDeliveredAt(),
                itemDtos,
                order.getPayment() != null ? order.getPayment().getPaymentMethod() : null,
                order.getPayment() != null ? order.getPayment().getPaymentStatus() : null,
                order.getPayment() != null ? order.getPayment().getTransactionId() : null,
                partner != null ? partner.getId() : null,
                partner != null ? partner.getUser().getFullName() : null,
                partner != null ? partner.getUser().getPhone() : null,
                partner != null ? partner.getVehicleType() : null,
                partner != null ? partner.getVehicleNumber() : null,
                partner != null ? partner.getCurrentLatitude() : null,
                partner != null ? partner.getCurrentLongitude() : null,
                partner != null ? partner.getRating() : null,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
