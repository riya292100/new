package com.quickcart.dto;

import com.quickcart.entity.OrderStatus;
import com.quickcart.entity.PaymentMethod;
import com.quickcart.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
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
}
