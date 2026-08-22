package com.quickcart.dto;

import com.quickcart.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusCountDto {
    private OrderStatus status;
    private Long count;
}
