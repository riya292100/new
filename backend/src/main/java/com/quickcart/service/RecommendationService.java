package com.quickcart.service;

import com.quickcart.dto.ProductResponseDto;
import com.quickcart.entity.Order;
import com.quickcart.entity.Product;
import com.quickcart.entity.User;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final AuthService authService;
    private final ProductService productService;

    public List<ProductResponseDto> getPersonalizedRecommendations(int limit) {
        User currentUser = null;
        try {
            currentUser = authService.getCurrentUserEntity();
        } catch (Exception ignored) {}

        if (currentUser != null) {
            List<Order> userOrders = orderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
            if (!userOrders.isEmpty()) {
                Set<Long> orderedCategoryIds = userOrders.stream()
                        .flatMap(o -> o.getItems().stream())
                        .map(item -> item.getProduct() != null && item.getProduct().getCategory() != null ? item.getProduct().getCategory().getId() : null)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());

                if (!orderedCategoryIds.isEmpty()) {
                    List<Product> recommended = productRepository.findByIsActiveTrue().stream()
                            .filter(p -> p.getCategory() != null && orderedCategoryIds.contains(p.getCategory().getId()))
                            .limit(limit)
                            .collect(Collectors.toList());

                    if (!recommended.isEmpty()) {
                        return recommended.stream().map(productService::mapToDto).collect(Collectors.toList());
                    }
                }
            }
        }

        // Fallback to top featured and best seller products
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue().stream()
                .limit(limit)
                .map(productService::mapToDto)
                .collect(Collectors.toList());
    }
}

