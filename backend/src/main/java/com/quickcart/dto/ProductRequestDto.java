package com.quickcart.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequestDto {

    private Long id;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "Product name is required")
    private String name;

    private String slug;

    @NotBlank(message = "Brand is required")
    private String brand;

    private String description;

    @NotNull(message = "MRP is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "MRP must be greater than 0")
    private BigDecimal mrp;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Selling price must be greater than 0")
    private BigDecimal sellingPrice;

    private Integer discountPercentage;

    @NotBlank(message = "Unit / Weight quantity is required")
    private String unitQuantity;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    private Integer lowStockThreshold = 10;
    private String sku;

    @NotBlank(message = "Product image URL is required")
    private String imageUrl;

    private BigDecimal rating;
    private Integer ratingCount;
    private Boolean isFeatured = false;
    private Boolean isDailyDeal = false;
    private Boolean isActive = true;
}
