package com.quickcart.dto;

import com.quickcart.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateRequest {

    @NotNull(message = "Order status is required")
    private OrderStatus status;

    private String notes;
}
