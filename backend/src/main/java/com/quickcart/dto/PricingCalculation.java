package com.quickcart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingCalculation {

    private BigDecimal rawItemTotal;      // Sum of (basePrice * quantity)
    private BigDecimal variantAdjustment; // Sum of variant price deltas
    private BigDecimal productDiscount;   // Discounts from product MRP/offers
    private BigDecimal itemSubtotal;      // Subtotal after product discounts
    private BigDecimal couponDiscount;    // Discount from applied promo coupon
    private BigDecimal walletDiscount;    // Loyalty points / QuickCash redeemed
    private BigDecimal taxableAmount;     // Taxable base
    private BigDecimal taxAmount;         // Calculated tax (e.g. 5% GST)
    private BigDecimal deliveryFee;       // Delivery charge (free if above threshold)
    private BigDecimal platformFee;       // Platform maintenance fee
    private BigDecimal finalPayableAmount;// Final amount customer pays
    private String appliedCouponCode;
    private List<String> appliedRules;
}
