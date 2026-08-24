package com.quickcart.service;

import com.quickcart.dto.AddToCartRequest;
import com.quickcart.dto.CartResponse;
import com.quickcart.entity.*;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.ProductRepository;
import com.quickcart.repository.UserRepository;
import com.quickcart.repository.WishlistItemRepository;
import com.quickcart.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private static final Logger logger = LoggerFactory.getLogger(WishlistService.class);

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    @Transactional
    public Wishlist getOrCreateWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            Wishlist wishlist = new Wishlist(user);
            return wishlistRepository.save(wishlist);
        });
    }

    @Transactional(readOnly = true)
    public List<Product> getWishlistProducts(Long userId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        List<Product> products = new ArrayList<>();
        for (WishlistItem item : wishlist.getItems()) {
            products.add(item.getProduct());
        }
        return products;
    }

    @Transactional
    public boolean toggleWishlist(Long userId, Long productId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        Optional<WishlistItem> existing = wishlistItemRepository.findByWishlistAndProduct(wishlist, product);
        if (existing.isPresent()) {
            wishlistItemRepository.delete(existing.get());
            wishlist.getItems().remove(existing.get());
            logger.info("Removed product {} from user {} wishlist", productId, userId);
            return false; // Removed
        } else {
            WishlistItem item = new WishlistItem(wishlist, product);
            wishlistItemRepository.save(item);
            wishlist.getItems().add(item);
            logger.info("Added product {} to user {} wishlist", productId, userId);
            return true; // Added
        }
    }

    @Transactional
    public CartResponse moveToCart(Long userId, Long productId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // 1. Remove from wishlist
        Optional<WishlistItem> existing = wishlistItemRepository.findByWishlistAndProduct(wishlist, product);
        existing.ifPresent(item -> {
            wishlistItemRepository.delete(item);
            wishlist.getItems().remove(item);
        });

        // 2. Add to cart with quantity 1
        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(productId);
        request.setQuantity(1);
        return cartService.addToCart(request);
    }

    @Transactional
    public void clearWishlist(Long userId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        wishlist.getItems().clear();
        wishlistRepository.save(wishlist);
        logger.info("Cleared wishlist for user {}", userId);
    }
}
