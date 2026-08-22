package com.quickcart.service;

import com.quickcart.dto.CouponDto;
import com.quickcart.dto.CouponValidationRequest;
import com.quickcart.dto.CouponValidationResponse;
import com.quickcart.entity.Coupon;
import com.quickcart.entity.DiscountType;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    public List<CouponDto> getActiveCoupons() {
        return couponRepository.findByIsActiveTrue().stream()
                .filter(c -> c.getValidUntil() == null || c.getValidUntil().isAfter(LocalDateTime.now()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<CouponDto> getAllCouponsAdmin() {
        return couponRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CouponValidationResponse validateCoupon(CouponValidationRequest request) {
        String code = request.getCode().trim().toUpperCase();
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(code)
                .orElse(null);

        if (coupon == null) {
            return new CouponValidationResponse(false, code, null, BigDecimal.ZERO, "Invalid or expired coupon code.");
        }

        if (coupon.getValidUntil() != null && coupon.getValidUntil().isBefore(LocalDateTime.now())) {
            return new CouponValidationResponse(false, code, null, BigDecimal.ZERO, "This coupon has expired.");
        }

        if (coupon.getTimesUsed() != null && coupon.getUsageLimit() != null && coupon.getTimesUsed() >= coupon.getUsageLimit()) {
            return new CouponValidationResponse(false, code, null, BigDecimal.ZERO, "Coupon usage limit reached.");
        }

        if (coupon.getMinOrderValue() != null && request.getItemTotal().compareTo(coupon.getMinOrderValue()) < 0) {
            return new CouponValidationResponse(
                    false,
                    code,
                    coupon.getDescription(),
                    BigDecimal.ZERO,
                    "Minimum order value of ₹" + coupon.getMinOrderValue() + " required to use this coupon."
            );
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = request.getItemTotal()
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else if (coupon.getDiscountType() == DiscountType.FLAT) {
            discount = coupon.getDiscountValue();
            if (discount.compareTo(request.getItemTotal()) > 0) {
                discount = request.getItemTotal();
            }
        }

        return new CouponValidationResponse(
                true,
                coupon.getCode(),
                coupon.getDescription(),
                discount,
                "Coupon applied successfully! You saved ₹" + discount
        );
    }

    @Transactional
    public CouponDto createCoupon(CouponDto dto) {
        String code = dto.getCode().trim().toUpperCase();
        if (couponRepository.existsByCodeIgnoreCase(code)) {
            throw new BadRequestException("Coupon with code '" + code + "' already exists.");
        }

        Coupon coupon = new Coupon();
        coupon.setCode(code);
        coupon.setDescription(dto.getDescription());
        coupon.setDiscountType(dto.getDiscountType());
        coupon.setDiscountValue(dto.getDiscountValue());
        coupon.setMinOrderValue(dto.getMinOrderValue() != null ? dto.getMinOrderValue() : BigDecimal.ZERO);
        coupon.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        coupon.setValidFrom(dto.getValidFrom() != null ? dto.getValidFrom() : LocalDateTime.now());
        coupon.setValidUntil(dto.getValidUntil());
        coupon.setUsageLimit(dto.getUsageLimit() != null ? dto.getUsageLimit() : 10000);
        coupon.setTimesUsed(0);
        coupon.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        return mapToDto(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon not found with id: " + id);
        }
        couponRepository.deleteById(id);
    }

    public CouponDto mapToDto(Coupon coupon) {
        return new CouponDto(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDescription(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                coupon.getMinOrderValue(),
                coupon.getMaxDiscountAmount(),
                coupon.getValidFrom(),
                coupon.getValidUntil(),
                coupon.getUsageLimit(),
                coupon.getTimesUsed(),
                coupon.getIsActive()
        );
    }
}
