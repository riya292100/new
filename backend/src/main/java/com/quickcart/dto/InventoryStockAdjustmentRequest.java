package com.quickcart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryStockAdjustmentRequest {

    @NotNull(message = "Store ID is required")
    private Long storeId;

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    @NotBlank(message = "Operation type is required (e.g. STOCK_IN, STOCK_OUT)")
    private String type; // STOCK_IN, STOCK_OUT

    private String notes;
}
