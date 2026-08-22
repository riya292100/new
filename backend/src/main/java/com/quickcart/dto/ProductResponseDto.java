package com.quickcart.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDto {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String name;
    private String slug;
    private String brand;
    private String description;
    private BigDecimal mrp;
    private BigDecimal sellingPrice;
    private Integer discountPercentage;
    private String unitQuantity;
    private Integer stockQuantity;
    private Integer lowStockThreshold;
    private Boolean inStock;
    private String sku;
    private String imageUrl;
    private BigDecimal rating;
    private Integer ratingCount;
    private Boolean isFeatured;
    private Boolean isDailyDeal;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
