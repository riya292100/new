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

    public List<ProductResponseDto> getFrequentlyBoughtTogether(Long productId, int limit) {
        if (productId == null) {
            return getPersonalizedRecommendations(limit);
        }

        Product baseProduct = productRepository.findById(productId).orElse(null);
        if (baseProduct == null) {
            return getPersonalizedRecommendations(limit);
        }

        // Find orders containing this product and retrieve co-occurring items
        List<Order> orders = orderRepository.findAll();
        Map<Long, Integer> coOccurrenceCount = new HashMap<>();

        for (Order order : orders) {
            boolean containsBase = order.getItems().stream()
                    .anyMatch(item -> item.getProduct() != null && item.getProduct().getId().equals(productId));
            if (containsBase) {
                for (var item : order.getItems()) {
                    if (item.getProduct() != null && !item.getProduct().getId().equals(productId)) {
                        coOccurrenceCount.put(item.getProduct().getId(),
                                coOccurrenceCount.getOrDefault(item.getProduct().getId(), 0) + item.getQuantity());
                    }
                }
            }
        }

        if (!coOccurrenceCount.isEmpty()) {
            List<Long> topProductIds = coOccurrenceCount.entrySet().stream()
                    .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                    .limit(limit)
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());

            List<Product> products = productRepository.findAllById(topProductIds);
            if (!products.isEmpty()) {
                return products.stream().map(productService::mapToDto).collect(Collectors.toList());
            }
        }

        // Fallback to same category items
        return getSimilarProducts(productId, limit);
    }

    public List<ProductResponseDto> getSimilarProducts(Long productId, int limit) {
        Product base = productRepository.findById(productId).orElse(null);
        if (base == null || base.getCategory() == null) {
            return getPersonalizedRecommendations(limit);
        }

        return productRepository.findByCategoryIdAndIsActiveTrue(base.getCategory().getId()).stream()
                .filter(p -> !p.getId().equals(productId))
                .limit(limit)
                .map(productService::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDto> getTrendingProducts(int limit) {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue().stream()
                .sorted(Comparator.comparing(Product::getRating, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(limit)
                .map(productService::mapToDto)
                .collect(Collectors.toList());
    }
}

