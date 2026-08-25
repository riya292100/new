package com.quickcart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantDto {
    private Long id;
    private Long productId;

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "Variant name is required")
    private String variantName;

    @NotBlank(message = "Variant value is required")
    private String variantValue;

    @NotNull(message = "MRP is required")
    @Positive(message = "MRP must be positive")
    private BigDecimal mrp;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    @Builder.Default
    private Integer stock = 20;

    private String imageUrl;

    @Builder.Default
    private Boolean isActive = true;
}
