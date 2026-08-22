package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal mrp;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    private Integer discountPercentage = 0;

    @Column(nullable = false, length = 50)
    private String unitQuantity; // "500 g", "1 L", "1 pack (6 pcs)", etc.

    @Column(nullable = false)
    private Integer stockQuantity = 0;

    private Integer lowStockThreshold = 10;

    @Column(unique = true, length = 100)
    private String sku;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Column(precision = 2, scale = 1)
    private BigDecimal rating = BigDecimal.valueOf(4.5);

    private Integer ratingCount = 0;

    private Boolean isFeatured = false;

    private Boolean isDailyDeal = false;

    private Boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
