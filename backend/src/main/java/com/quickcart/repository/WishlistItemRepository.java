package com.quickcart.repository;

import com.quickcart.entity.Product;
import com.quickcart.entity.Wishlist;
import com.quickcart.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    Optional<WishlistItem> findByWishlistAndProduct(Wishlist wishlist, Product product);
    void deleteByWishlistAndProduct(Wishlist wishlist, Product product);
}
