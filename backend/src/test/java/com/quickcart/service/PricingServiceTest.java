package com.quickcart.service;

import com.quickcart.dto.PricingCalculation;
import com.quickcart.entity.CartItem;
import com.quickcart.entity.Coupon;
import com.quickcart.entity.DiscountType;
import com.quickcart.entity.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PricingServiceTest {

    private PricingService pricingService;

    @BeforeEach
    void setUp() {
        pricingService = new PricingService();
        ReflectionTestUtils.setField(pricingService, "freeDeliveryThreshold", 199.0);
        ReflectionTestUtils.setField(pricingService, "baseDeliveryFee", 25.0);
        ReflectionTestUtils.setField(pricingService, "platformFee", 5.0);
        ReflectionTestUtils.setField(pricingService, "taxRate", 0.05);
    }

    @Test
    @DisplayName("Empty cart returns zero totals")
    void testEmptyCart() {
        PricingCalculation result = pricingService.calculate(Collections.emptyList(), null, BigDecimal.ZERO);
        assertNotNull(result);
        assertEquals(new BigDecimal("0.00"), result.getItemSubtotal());
        assertEquals(new BigDecimal("0.00"), result.getFinalPayableAmount());
    }

    @Test
    @DisplayName("Order under ₹199 adds delivery fee of ₹25 and platform fee of ₹5")
    void testUnderThresholdDeliveryFee() {
        Product p = Product.builder()
                .sellingPrice(new BigDecimal("100.00"))
                .mrp(new BigDecimal("120.00"))
                .build();
        CartItem item = CartItem.builder().product(p).quantity(1).build();

        PricingCalculation result = pricingService.calculate(List.of(item), null, BigDecimal.ZERO);

        assertEquals(new BigDecimal("100.00"), result.getItemSubtotal());
        assertEquals(new BigDecimal("25.00"), result.getDeliveryFee());
        assertEquals(new BigDecimal("5.00"), result.getPlatformFee());
        assertEquals(new BigDecimal("5.00"), result.getTaxAmount()); // 5% of 100
        // Total = 100 + 5 (tax) + 25 (delivery) + 5 (platform) = 135.00
        assertEquals(new BigDecimal("135.00"), result.getFinalPayableAmount());
    }

    @Test
    @DisplayName("Order over ₹199 qualifies for free delivery")
    void testFreeDeliveryThreshold() {
        Product p = Product.builder()
                .sellingPrice(new BigDecimal("250.00"))
                .mrp(new BigDecimal("300.00"))
                .build();
        CartItem item = CartItem.builder().product(p).quantity(1).build();

        PricingCalculation result = pricingService.calculate(List.of(item), null, BigDecimal.ZERO);

        assertEquals(new BigDecimal("250.00"), result.getItemSubtotal());
        assertEquals(new BigDecimal("0.00"), result.getDeliveryFee());
        assertEquals(new BigDecimal("5.00"), result.getPlatformFee());
        assertEquals(new BigDecimal("12.50"), result.getTaxAmount()); // 5% of 250
        // Total = 250 + 12.50 (tax) + 0 (delivery) + 5 (platform) = 267.50
        assertEquals(new BigDecimal("267.50"), result.getFinalPayableAmount());
    }

    @Test
    @DisplayName("Percentage coupon applies up to maxDiscountAmount cap")
    void testPercentageCouponWithCap() {
        Product p = Product.builder()
                .sellingPrice(new BigDecimal("1000.00"))
                .mrp(new BigDecimal("1000.00"))
                .build();
        CartItem item = CartItem.builder().product(p).quantity(1).build();

        Coupon coupon = Coupon.builder()
                .code("SAVE50")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("50.00")) // 50% = 500, but capped at 100
                .maxDiscountAmount(new BigDecimal("100.00"))
                .minOrderValue(new BigDecimal("200.00"))
                .isActive(true)
                .build();

        PricingCalculation result = pricingService.calculate(List.of(item), coupon, BigDecimal.ZERO);

        assertEquals(new BigDecimal("100.00"), result.getCouponDiscount());
        assertEquals(new BigDecimal("900.00"), result.getTaxableAmount());
        assertEquals("SAVE50", result.getAppliedCouponCode());
    }

    @Test
    @DisplayName("Coupon is rejected when order subtotal is below minOrderValue")
    void testCouponMinimumOrderNotMet() {
        Product p = Product.builder()
                .sellingPrice(new BigDecimal("150.00"))
                .build();
        CartItem item = CartItem.builder().product(p).quantity(1).build();

        Coupon coupon = Coupon.builder()
                .code("BIGSAVE")
                .discountType(DiscountType.FLAT)
                .discountValue(new BigDecimal("50.00"))
                .minOrderValue(new BigDecimal("300.00"))
                .isActive(true)
                .build();

        PricingCalculation result = pricingService.calculate(List.of(item), coupon, BigDecimal.ZERO);

        assertEquals(new BigDecimal("0.00"), result.getCouponDiscount());
        assertNull(result.getAppliedCouponCode());
    }

    @Test
    @DisplayName("Wallet redemption deduction is capped at payable amount")
    void testWalletPointsRedemption() {
        Product p = Product.builder()
                .sellingPrice(new BigDecimal("300.00"))
                .build();
        CartItem item = CartItem.builder().product(p).quantity(1).build();

        // Customer wants to redeem ₹500, but subtotal is only ₹300
        PricingCalculation result = pricingService.calculate(List.of(item), null, new BigDecimal("500.00"));

        assertEquals(new BigDecimal("300.00"), result.getWalletDiscount());
        assertEquals(new BigDecimal("0.00"), result.getTaxableAmount());
        assertEquals(new BigDecimal("0.00"), result.getTaxAmount());
        // Still has platform fee ₹5
        assertEquals(new BigDecimal("5.00"), result.getFinalPayableAmount());
    }
}
