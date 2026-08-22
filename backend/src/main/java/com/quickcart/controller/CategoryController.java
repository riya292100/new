package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import com.quickcart.dto.CategoryDto;
import com.quickcart.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Endpoints for grocery category browsing")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get all active categories ordered by display sequence")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        List<CategoryDto> categories = categoryService.getAllActiveCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single category by ID")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryById(@PathVariable Long id) {
        CategoryDto category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get single category by URL slug")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryBySlug(@PathVariable String slug) {
        CategoryDto category = categoryService.getCategoryBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(category));
    }
}
