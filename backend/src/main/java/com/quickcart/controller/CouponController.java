package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import com.quickcart.dto.CouponDto;
import com.quickcart.dto.CouponValidationRequest;
import com.quickcart.dto.CouponValidationResponse;
import com.quickcart.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Endpoints for available coupons and discount validation")
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/active")
    @Operation(summary = "Get all active coupons eligible for customers")
    public ResponseEntity<ApiResponse<List<CouponDto>>> getActiveCoupons() {
        List<CouponDto> coupons = couponService.getActiveCoupons();
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate coupon code against order item total")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> validateCoupon(
            @Valid @RequestBody CouponValidationRequest request
    ) {
        CouponValidationResponse response = couponService.validateCoupon(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
