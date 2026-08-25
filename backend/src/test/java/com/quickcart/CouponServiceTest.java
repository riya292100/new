package com.quickcart;

import com.quickcart.dto.CouponValidationRequest;
import com.quickcart.dto.CouponValidationResponse;
import com.quickcart.entity.Coupon;
import com.quickcart.entity.DiscountType;
import com.quickcart.repository.CouponRepository;
import com.quickcart.service.CouponService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private com.quickcart.repository.CouponUsageRepository couponUsageRepository;

    @Mock
    private com.quickcart.service.AuthService authService;

    @InjectMocks
    private CouponService couponService;

    private Coupon percentageCoupon;
    private Coupon flatCoupon;

    @BeforeEach
    void setUp() {
        percentageCoupon = new Coupon();
        percentageCoupon.setCode("WELCOME50");
        percentageCoupon.setDiscountType(DiscountType.PERCENTAGE);
        percentageCoupon.setDiscountValue(BigDecimal.valueOf(50));
        percentageCoupon.setMinOrderValue(BigDecimal.valueOf(150));
        percentageCoupon.setMaxDiscountAmount(BigDecimal.valueOf(100));
        percentageCoupon.setValidUntil(LocalDateTime.now().plusDays(10));
        percentageCoupon.setUsageLimit(1000);
        percentageCoupon.setTimesUsed(0);
        percentageCoupon.setIsActive(true);

        flatCoupon = new Coupon();
        flatCoupon.setCode("FLAT50");
        flatCoupon.setDiscountType(DiscountType.FLAT);
        flatCoupon.setDiscountValue(BigDecimal.valueOf(50));
        flatCoupon.setMinOrderValue(BigDecimal.valueOf(200));
        flatCoupon.setValidUntil(LocalDateTime.now().plusDays(10));
        flatCoupon.setUsageLimit(1000);
        flatCoupon.setTimesUsed(0);
        flatCoupon.setIsActive(true);
    }

    @Test
    void testValidatePercentageCoupon_Success() {
        when(couponRepository.findByCodeIgnoreCaseAndIsActiveTrue("WELCOME50"))
                .thenReturn(Optional.of(percentageCoupon));

        CouponValidationRequest request = new CouponValidationRequest("WELCOME50", BigDecimal.valueOf(300));
        CouponValidationResponse response = couponService.validateCoupon(request);

        assertTrue(response.getIsValid());
        // 50% of 300 is 150, but max discount is 100
        assertEquals(0, BigDecimal.valueOf(100).compareTo(response.getDiscountAmount()));
    }

    @Test
    void testValidateCoupon_BelowMinOrderValue() {
        when(couponRepository.findByCodeIgnoreCaseAndIsActiveTrue("WELCOME50"))
                .thenReturn(Optional.of(percentageCoupon));

        CouponValidationRequest request = new CouponValidationRequest("WELCOME50", BigDecimal.valueOf(100));
        CouponValidationResponse response = couponService.validateCoupon(request);

        assertFalse(response.getIsValid());
        assertTrue(response.getMessage().contains("Minimum order value"));
    }

    @Test
    void testValidateCoupon_InvalidCode() {
        when(couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(anyString()))
                .thenReturn(Optional.empty());

        CouponValidationRequest request = new CouponValidationRequest("INVALID", BigDecimal.valueOf(500));
        CouponValidationResponse response = couponService.validateCoupon(request);

        assertFalse(response.getIsValid());
        assertEquals("Invalid or expired coupon code.", response.getMessage());
    }

    @Test
    void testValidateFlatCoupon_Success() {
        when(couponRepository.findByCodeIgnoreCaseAndIsActiveTrue("FLAT50"))
                .thenReturn(Optional.of(flatCoupon));

        CouponValidationRequest request = new CouponValidationRequest("FLAT50", BigDecimal.valueOf(250));
        CouponValidationResponse response = couponService.validateCoupon(request);

        assertTrue(response.getIsValid());
        assertEquals(0, BigDecimal.valueOf(50).compareTo(response.getDiscountAmount()));
    }
}
