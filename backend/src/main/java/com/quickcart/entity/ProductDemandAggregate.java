package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Analytical Product Demand & Velocity Aggregate Table.
 * Computed by the ETL pipeline for popularity rankings and demand forecasting.
 */
@Entity
@Table(name = "product_demand_aggregates", indexes = {
        @Index(name = "idx_demand_agg_product", columnList = "product_id"),
        @Index(name = "idx_demand_agg_period", columnList = "period_start, period_end")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDemandAggregate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "units_sold", nullable = false)
    private Long unitsSold;

    @Column(name = "total_revenue", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalRevenue;

    @Column(name = "velocity_score", nullable = false)
    private Double velocityScore;

    @Column(name = "period_start", nullable = false)
    private LocalDateTime periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDateTime periodEnd;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
