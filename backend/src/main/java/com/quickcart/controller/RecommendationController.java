package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import com.quickcart.dto.ProductResponseDto;
import com.quickcart.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/recommendations", "/api/recommendations", "/api/v1/recommendations"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getRecommendations(
            @RequestParam(defaultValue = "10") int limit) {
        List<ProductResponseDto> recommendations = recommendationService.getPersonalizedRecommendations(limit);
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }

    @GetMapping("/frequently-bought-together")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getFrequentlyBoughtTogether(
            @RequestParam Long productId,
            @RequestParam(defaultValue = "6") int limit) {
        List<ProductResponseDto> list = recommendationService.getFrequentlyBoughtTogether(productId, limit);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/similar")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getSimilarProducts(
            @RequestParam Long productId,
            @RequestParam(defaultValue = "6") int limit) {
        List<ProductResponseDto> list = recommendationService.getSimilarProducts(productId, limit);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getTrending(
            @RequestParam(defaultValue = "10") int limit) {
        List<ProductResponseDto> list = recommendationService.getTrendingProducts(limit);
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
