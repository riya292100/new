package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Analytical Dimension Aggregate Table.
 * Populated by scheduled Data Engineering ETL batch jobs for fast dashboard querying.
 */
@Entity
@Table(name = "hourly_sales_aggregates", indexes = {
        @Index(name = "idx_sales_agg_hour", columnList = "aggregation_hour")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HourlySalesAggregate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "aggregation_hour", nullable = false)
    private LocalDateTime aggregationHour;

    @Column(name = "total_orders", nullable = false)
    private Long totalOrders;

    @Column(name = "total_revenue", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalRevenue;

    @Column(name = "total_delivery_fees", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalDeliveryFees;

    @Column(name = "total_discounts", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalDiscounts;

    @Column(name = "total_items_sold", nullable = false)
    private Long totalItemsSold;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
