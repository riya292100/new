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
public class TopProductDto {
    private Long productId;
    private String productName;
    private String productImage;
    private Long unitsSold;
    private BigDecimal totalRevenue;
}
