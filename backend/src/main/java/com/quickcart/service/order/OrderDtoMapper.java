package com.quickcart.service.order;

import com.quickcart.dto.*;
import com.quickcart.entity.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Dedicated DTO Mapper for Order domain objects.
 * Decouples presentation payloads from transactional database entities.
 */
@Component
public class OrderDtoMapper {

    public OrderResponse mapToDto(Order order) {
        if (order == null) return null;

        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(this::mapItemToDto).collect(Collectors.toList())
                : Collections.emptyList();

        AddressDto addressDto = mapAddressToDto(order.getAddress());
        PaymentResponseDto paymentDto = mapPaymentToDto(order);

        BigDecimal itemTotal = order.getItemTotal() != null
                ? order.getItemTotal()
                : (order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO);

        BigDecimal cashbackEarned = itemTotal.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus(),
                itemTotal,
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

    public OrderItemResponse mapItemToDto(OrderItem item) {
        if (item == null) return null;
        return new OrderItemResponse(
                item.getId(),
                item.getProduct() != null ? item.getProduct().getId() : null,
                item.getProductName(),
                item.getProductImage(),
                item.getUnitQuantity(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getTotalPrice()
        );
    }

    public AddressDto mapAddressToDto(Address a) {
        if (a == null) return null;
        return new AddressDto(
                a.getId(), a.getLabel(), a.getReceiverName(), a.getReceiverPhone(),
                a.getStreetAddress(), a.getApartmentUnit(), a.getLandmark(),
                a.getCity(), a.getState(), a.getPincode(), a.getLatitude(),
                a.getLongitude(), a.getIsDefault()
        );
    }

    public PaymentResponseDto mapPaymentToDto(Order order) {
        if (order == null || order.getPayment() == null) return null;
        Payment p = order.getPayment();
        return PaymentResponseDto.builder()
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
}
