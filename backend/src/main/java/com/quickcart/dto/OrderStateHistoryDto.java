package com.quickcart.dto;

import com.quickcart.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStateHistoryDto {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private OrderStatus fromStatus;
    private OrderStatus toStatus;
    private String actor;
    private String reason;
    private LocalDateTime createdAt;
}
