package com.quickcart.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private String brand;
    private String productImage;
    private String unitQuantity;
    private BigDecimal mrp;
    private BigDecimal unitPrice;
    private Integer discountPercentage;
    private Integer quantity;
    private BigDecimal itemTotal;
    private Integer stockQuantity;
    private Boolean inStock;
}
