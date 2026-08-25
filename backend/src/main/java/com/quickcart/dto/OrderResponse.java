package com.quickcart.dto;

import com.quickcart.entity.OrderStatus;
import com.quickcart.entity.PaymentMethod;
import com.quickcart.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String customerName;
    private String customerPhone;
    private AddressDto address;
    private OrderStatus status;
    private BigDecimal itemTotal;
    private BigDecimal deliveryFee;
    private BigDecimal platformFee;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal walletDiscountAmount;
    private BigDecimal cashbackEarned;
    private BigDecimal tipAmount;
    private BigDecimal totalAmount;
    private String couponCode;
    private String deliveryInstructions;
    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime deliveredAt;
    @Builder.Default
    private List<OrderItemResponse> items = new ArrayList<>();
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String transactionId;

    // Delivery Partner Details (if assigned)
    private Long deliveryPartnerId;
    private String deliveryPartnerName;
    private String deliveryPartnerPhone;
    private String vehicleType;
    private String vehicleNumber;
    private BigDecimal partnerLatitude;
    private BigDecimal partnerLongitude;
    private BigDecimal partnerRating;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OrderResponse(
            Long id,
            String orderNumber,
            OrderStatus status,
            BigDecimal itemTotal,
            BigDecimal deliveryFee,
            BigDecimal platformFee,
            BigDecimal taxAmount,
            BigDecimal discountAmount,
            BigDecimal walletDiscountAmount,
            BigDecimal cashbackEarned,
            BigDecimal tipAmount,
            BigDecimal totalAmount,
            String couponCode,
            String deliveryInstructions,
            LocalDateTime estimatedDeliveryTime,
            LocalDateTime deliveredAt,
            List<OrderItemResponse> items,
            AddressDto address,
            PaymentResponseDto payment,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.status = status;
        this.itemTotal = itemTotal;
        this.deliveryFee = deliveryFee;
        this.platformFee = platformFee;
        this.taxAmount = taxAmount;
        this.discountAmount = discountAmount;
        this.walletDiscountAmount = walletDiscountAmount;
        this.cashbackEarned = cashbackEarned;
        this.tipAmount = tipAmount;
        this.totalAmount = totalAmount;
        this.couponCode = couponCode;
        this.deliveryInstructions = deliveryInstructions;
        this.estimatedDeliveryTime = estimatedDeliveryTime;
        this.deliveredAt = deliveredAt;
        this.items = items != null ? items : new ArrayList<>();
        this.address = address;
        if (payment != null) {
            this.paymentMethod = payment.getPaymentMethod();
            this.paymentStatus = payment.getPaymentStatus();
            this.transactionId = payment.getTransactionId();
        }
        this.createdAt = createdAt;
    }
}
