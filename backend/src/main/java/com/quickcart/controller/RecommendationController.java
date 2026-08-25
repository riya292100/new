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
}
