package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import com.quickcart.dto.ReviewRequestDto;
import com.quickcart.dto.ReviewResponseDto;
import com.quickcart.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/reviews", "/api/reviews"})
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Endpoints for customer product ratings and reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get reviews for a product")
    public ResponseEntity<ApiResponse<List<ReviewResponseDto>>> getProductReviews(@PathVariable Long productId) {
        List<ReviewResponseDto> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @PostMapping
    @Operation(summary = "Submit a rating & review for a product")
    public ResponseEntity<ApiResponse<ReviewResponseDto>> addReview(@Valid @RequestBody ReviewRequestDto dto) {
        ReviewResponseDto review = reviewService.addReview(dto);
        return ResponseEntity.ok(ApiResponse.success("Review submitted successfully", review));
    }
}
