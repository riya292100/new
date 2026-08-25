package com.quickcart.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Brand brandEntity;

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

    @Builder.Default
    private Integer discountPercentage = 0;

    @Column(nullable = false, length = 50)
    private String unitQuantity; // "500 g", "1 L", "1 pack (6 pcs)", "1 Unit", etc.

    @Builder.Default
    @Column(nullable = false)
    private Integer stockQuantity = 0;

    @Builder.Default
    private Integer lowStockThreshold = 10;

    @Column(unique = true, length = 100)
    private String sku;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Builder.Default
    @Column(precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.valueOf(4.5);

    @Builder.Default
    private Integer ratingCount = 0;

    @Builder.Default
    private Boolean isFeatured = false;

    @Builder.Default
    private Boolean isDailyDeal = false;

    @Builder.Default
    private Boolean isActive = true;

    @Column(length = 100)
    private String shelfLife;

    @Column(length = 100)
    private String storageType;

    @Builder.Default
    @Column(length = 100)
    private String countryOfOrigin = "India";

    @Column(length = 255)
    private String tags;

    @Builder.Default
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public String getBrandName() {
        if (brandEntity != null && brandEntity.getName() != null) {
            return brandEntity.getName();
        }
        return brand != null ? brand : "QuickCart Essentials";
    }
}
