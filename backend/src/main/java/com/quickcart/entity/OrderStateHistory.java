package com.quickcart.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_state_history", indexes = {
        @Index(name = "idx_order_history_order_id", columnList = "order_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStateHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "items", "deliveryAssignment"})
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private OrderStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus toStatus;

    @Column(length = 100)
    private String actor; // e.g. "CUSTOMER", "SYSTEM_CHECKOUT", "STORE_MANAGER", "DRIVER:101", "ADMIN"

    @Column(length = 500)
    private String reason;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
