package com.quickcart.controller;

import com.quickcart.dto.AddToCartRequest;
import com.quickcart.dto.ApiResponse;
import com.quickcart.dto.CartResponse;
import com.quickcart.dto.UpdateCartItemRequest;
import com.quickcart.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Endpoints for managing customer shopping cart")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current user's active shopping cart")
    public ResponseEntity<ApiResponse<CartResponse>> getCart() {
        CartResponse cart = cartService.getCart();
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PostMapping("/items")
    @Operation(summary = "Add a product to cart")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(@Valid @RequestBody AddToCartRequest request) {
        CartResponse cart = cartService.addToCart(request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update quantity of a cart item")
    public ResponseEntity<ApiResponse<CartResponse>> updateItemQuantity(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        CartResponse cart = cartService.updateCartItemQuantity(itemId, request);
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove an item from cart")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(@PathVariable Long itemId) {
        CartResponse cart = cartService.removeCartItem(itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }
}
