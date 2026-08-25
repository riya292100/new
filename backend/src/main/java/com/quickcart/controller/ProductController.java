package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import com.quickcart.dto.ProductResponseDto;
import com.quickcart.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping({"/api/v1/products", "/api/products"})
@RequiredArgsConstructor
@Tag(name = "Products", description = "Endpoints for product search, filtering, and recommendations")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get filtered and paginated products")
    public ResponseEntity<ApiResponse<Page<ProductResponseDto>>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String brand,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<ProductResponseDto> products = productService.getAllProducts(
                categoryId, minPrice, maxPrice, brand, sortBy, sortDirection, page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured products")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getFeaturedProducts() {
        List<ProductResponseDto> products = productService.getFeaturedProducts();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/deals")
    @Operation(summary = "Get daily deal products")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getDailyDeals() {
        List<ProductResponseDto> products = productService.getDailyDeals();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get all active products in a category")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getByCategory(@PathVariable Long categoryId) {
        List<ProductResponseDto> products = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/search")
    @Operation(summary = "Search products by query string")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> searchProducts(@RequestParam String q) {
        List<ProductResponseDto> products = productService.searchProducts(q);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/search/suggestions")
    @Operation(summary = "Get instant search autocomplete suggestions")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> searchSuggestions(
            @RequestParam String q,
            @RequestParam(defaultValue = "6") int limit
    ) {
        List<ProductResponseDto> suggestions = productService.getSearchSuggestions(q, limit);
        return ResponseEntity.ok(ApiResponse.success(suggestions));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single product by ID")
    public ResponseEntity<ApiResponse<ProductResponseDto>> getProductById(@PathVariable Long id) {
        ProductResponseDto product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get single product by URL slug")
    public ResponseEntity<ApiResponse<ProductResponseDto>> getProductBySlug(@PathVariable String slug) {
        ProductResponseDto product = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @GetMapping("/{id}/related")
    @Operation(summary = "Get related / recommended products in the same category")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getRelatedProducts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "6") int limit
    ) {
        List<ProductResponseDto> related = productService.getRelatedProducts(id, limit);
        return ResponseEntity.ok(ApiResponse.success(related));
    }
}
