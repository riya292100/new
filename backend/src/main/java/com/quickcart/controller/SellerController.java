package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import com.quickcart.dto.ProductRequestDto;
import com.quickcart.entity.Product;
import com.quickcart.security.UserDetailsImpl;
import com.quickcart.service.SellerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
public class SellerController {

    private final SellerService sellerService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSellerDashboard(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String sellerName = (userDetails != null) ? userDetails.getUsername() : "QuickCart Assured";
        Map<String, Object> stats = sellerService.getSellerDashboard(sellerName);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/products")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Product>>> getSellerProducts() {
        List<Product> products = sellerService.getSellerProducts();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @PostMapping("/products")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Product>> addProduct(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ProductRequestDto requestDto) {
        String sellerName = (userDetails != null) ? userDetails.getUsername() : "QuickCart Assured";
        Product saved = sellerService.addSellerProduct(requestDto, sellerName);
        return ResponseEntity.ok(ApiResponse.success("Product listed on marketplace successfully", saved));
    }
}
