package com.quickcart.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "inventories",
        uniqueConstraints = @UniqueConstraint(columnNames = {"store_id", "product_id"})
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private DarkStore store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Product product;

    @Builder.Default
    @Column(nullable = false)
    private Integer availableQuantity = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer reservedQuantity = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer soldQuantity = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer damagedQuantity = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer incomingQuantity = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer reorderLevel = 10;

    @Builder.Default
    @Column(nullable = false)
    private Integer maxStock = 200;

    @Builder.Default
    @Column(nullable = false)
    private Integer lowStockThreshold = 5;

    @Version
    @Column(nullable = false)
    private Long version;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public int getTotalQuantity() {
        return (availableQuantity != null ? availableQuantity : 0) +
                (reservedQuantity != null ? reservedQuantity : 0);
    }

    public boolean isLowStock() {
        return (availableQuantity != null ? availableQuantity : 0) <= (lowStockThreshold != null ? lowStockThreshold : 5);
    }
}
