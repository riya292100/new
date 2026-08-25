package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import com.quickcart.dto.BrandDto;
import com.quickcart.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/brands", "/api/brands"})
@RequiredArgsConstructor
@Tag(name = "Brand Management", description = "APIs for managing product brands")
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    @Operation(summary = "Get all active brands")
    public ResponseEntity<List<BrandDto>> getAllBrands() {
        return ResponseEntity.ok(brandService.getAllBrands());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get brand by ID")
    public ResponseEntity<BrandDto> getBrandById(@PathVariable Long id) {
        return ResponseEntity.ok(brandService.getBrandById(id));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get brand by slug")
    public ResponseEntity<BrandDto> getBrandBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(brandService.getBrandBySlug(slug));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER')")
    @Operation(summary = "Create a new brand (Admin / Store Manager)")
    public ResponseEntity<BrandDto> createBrand(@Valid @RequestBody BrandDto brandDto) {
        return new ResponseEntity<>(brandService.createBrand(brandDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER')")
    @Operation(summary = "Update an existing brand")
    public ResponseEntity<BrandDto> updateBrand(@PathVariable Long id, @Valid @RequestBody BrandDto brandDto) {
        return ResponseEntity.ok(brandService.updateBrand(id, brandDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate brand (Admin)")
    public ResponseEntity<ApiResponse> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok(new ApiResponse(true, "Brand deactivated successfully"));
    }
}
