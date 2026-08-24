package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import com.quickcart.dto.CartResponse;
import com.quickcart.entity.Product;
import com.quickcart.security.UserDetailsImpl;
import com.quickcart.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getWishlist(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Product> products = wishlistService.getWishlistProducts(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @PostMapping("/toggle/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleWishlist(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long productId) {
        boolean isAdded = wishlistService.toggleWishlist(userDetails.getId(), productId);
        Map<String, Object> result = new HashMap<>();
        result.put("productId", productId);
        result.put("inWishlist", isAdded);
        result.put("message", isAdded ? "Added to wishlist" : "Removed from wishlist");
        return ResponseEntity.ok(ApiResponse.success(isAdded ? "Product added to wishlist" : "Product removed from wishlist", result));
    }

    @PostMapping("/move-to-cart/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> moveToCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long productId) {
        CartResponse cart = wishlistService.moveToCart(userDetails.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Item moved from wishlist to cart", cart));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearWishlist(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        wishlistService.clearWishlist(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Wishlist cleared successfully", null));
    }
}
