package com.quickcart.service;

import com.quickcart.dto.PricingCalculation;
import com.quickcart.entity.CartItem;
import com.quickcart.entity.Coupon;
import com.quickcart.entity.DiscountType;
import com.quickcart.entity.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PricingService {

    @Value("${quickcart.app.freeDeliveryThreshold:199.0}")
    private double freeDeliveryThreshold;

    @Value("${quickcart.app.baseDeliveryFee:25.0}")
    private double baseDeliveryFee;

    @Value("${quickcart.app.platformFee:5.0}")
    private double platformFee;

    @Value("${quickcart.app.taxRate:0.05}")
    private double taxRate;

    /**
     * Authoritative server-side pricing computation pipeline:
     * Base Price -> Variant Adjustment -> Product Discount -> Coupon Discount -> Wallet Redemption -> Tax -> Delivery/Platform -> Final
     */
    public PricingCalculation calculate(List<CartItem> items, Coupon coupon, BigDecimal walletRedemption) {
        List<String> rules = new ArrayList<>();
        BigDecimal rawTotal = BigDecimal.ZERO;
        BigDecimal variantDelta = BigDecimal.ZERO;
        BigDecimal productDiscountTotal = BigDecimal.ZERO;
        BigDecimal itemSubtotal = BigDecimal.ZERO;

        if (items != null) {
            for (CartItem item : items) {
                Product product = item.getProduct();
                if (product == null) continue;

                int qty = Math.max(1, item.getQuantity());
                BigDecimal selling = product.getSellingPrice() != null ? product.getSellingPrice() : BigDecimal.ZERO;
                BigDecimal mrp = product.getMrp() != null ? product.getMrp() : selling;

                BigDecimal lineRaw = mrp.multiply(BigDecimal.valueOf(qty));
                BigDecimal lineSelling = selling.multiply(BigDecimal.valueOf(qty));
                BigDecimal lineProductDiscount = lineRaw.subtract(lineSelling).max(BigDecimal.ZERO);

                rawTotal = rawTotal.add(lineRaw);
                productDiscountTotal = productDiscountTotal.add(lineProductDiscount);
                itemSubtotal = itemSubtotal.add(lineSelling);
            }
        }

        rules.add("Calculated item subtotal: ₹" + itemSubtotal.setScale(2, RoundingMode.HALF_UP));

        // 1. Coupon Discount Calculation
        BigDecimal couponDiscount = BigDecimal.ZERO;
        String couponCode = null;
        if (coupon != null && Boolean.TRUE.equals(coupon.getIsActive())) {
            couponCode = coupon.getCode();
            BigDecimal minOrder = coupon.getMinOrderValue() != null ? coupon.getMinOrderValue() : BigDecimal.ZERO;

            if (itemSubtotal.compareTo(minOrder) >= 0) {
                if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
                    BigDecimal percentage = coupon.getDiscountValue() != null ? coupon.getDiscountValue() : BigDecimal.ZERO;
                    BigDecimal calculatedDiscount = itemSubtotal.multiply(percentage).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    if (coupon.getMaxDiscountAmount() != null) {
                        calculatedDiscount = calculatedDiscount.min(coupon.getMaxDiscountAmount());
                    }
                    couponDiscount = calculatedDiscount.min(itemSubtotal);
                } else if (coupon.getDiscountType() == DiscountType.FLAT) {
                    BigDecimal flatDiscount = coupon.getDiscountValue() != null ? coupon.getDiscountValue() : BigDecimal.ZERO;
                    couponDiscount = flatDiscount.min(itemSubtotal);
                }
                rules.add("Applied promo coupon [" + couponCode + "]: -₹" + couponDiscount.setScale(2, RoundingMode.HALF_UP));
            } else {
                rules.add("Coupon [" + couponCode + "] skipped: minimum order requirement ₹" + minOrder + " not met");
            }
        }

        BigDecimal afterCoupon = itemSubtotal.subtract(couponDiscount).max(BigDecimal.ZERO);

        // 2. Wallet Points Redemption
        BigDecimal walletDeduction = BigDecimal.ZERO;
        if (walletRedemption != null && walletRedemption.compareTo(BigDecimal.ZERO) > 0) {
            walletDeduction = walletRedemption.min(afterCoupon);
            rules.add("Applied QuickCash wallet balance: -₹" + walletDeduction.setScale(2, RoundingMode.HALF_UP));
        }

        BigDecimal taxableAmount = afterCoupon.subtract(walletDeduction).max(BigDecimal.ZERO);

        // 3. Tax calculation (e.g., 5% GST on taxable goods)
        BigDecimal tax = taxableAmount.multiply(BigDecimal.valueOf(taxRate)).setScale(2, RoundingMode.HALF_UP);
        rules.add("Applied standard GST (" + (int)(taxRate * 100) + "%): +₹" + tax);

        // 4. Delivery & Platform Fees
        BigDecimal delivery = BigDecimal.ZERO;
        if (itemSubtotal.compareTo(BigDecimal.valueOf(freeDeliveryThreshold)) < 0 && itemSubtotal.compareTo(BigDecimal.ZERO) > 0) {
            delivery = BigDecimal.valueOf(baseDeliveryFee);
            rules.add("Applied standard delivery fee: +₹" + delivery);
        } else if (itemSubtotal.compareTo(BigDecimal.ZERO) > 0) {
            rules.add("Free delivery applied (order total exceeds ₹" + freeDeliveryThreshold + ")");
        }

        BigDecimal platform = itemSubtotal.compareTo(BigDecimal.ZERO) > 0 ? BigDecimal.valueOf(platformFee) : BigDecimal.ZERO;
        if (platform.compareTo(BigDecimal.ZERO) > 0) {
            rules.add("Applied platform maintenance fee: +₹" + platform);
        }

        // 5. Final Payable Calculation
        BigDecimal finalPayable = taxableAmount.add(tax).add(delivery).add(platform).setScale(2, RoundingMode.HALF_UP);

        return PricingCalculation.builder()
                .rawItemTotal(rawTotal.setScale(2, RoundingMode.HALF_UP))
                .variantAdjustment(variantDelta.setScale(2, RoundingMode.HALF_UP))
                .productDiscount(productDiscountTotal.setScale(2, RoundingMode.HALF_UP))
                .itemSubtotal(itemSubtotal.setScale(2, RoundingMode.HALF_UP))
                .couponDiscount(couponDiscount.setScale(2, RoundingMode.HALF_UP))
                .walletDiscount(walletDeduction.setScale(2, RoundingMode.HALF_UP))
                .taxableAmount(taxableAmount.setScale(2, RoundingMode.HALF_UP))
                .taxAmount(tax)
                .deliveryFee(delivery.setScale(2, RoundingMode.HALF_UP))
                .platformFee(platform.setScale(2, RoundingMode.HALF_UP))
                .finalPayableAmount(finalPayable)
                .appliedCouponCode(couponDiscount.compareTo(BigDecimal.ZERO) > 0 ? couponCode : null)
                .appliedRules(rules)
                .build();
    }
}
