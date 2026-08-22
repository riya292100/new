package com.quickcart.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPartnerAssignmentRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Delivery Partner ID is required")
    private Long partnerId;
}
