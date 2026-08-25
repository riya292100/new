package com.quickcart.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "return_requests", indexes = {
        @Index(name = "idx_return_number", columnList = "returnNumber"),
        @Index(name = "idx_return_order_id", columnList = "order_id"),
        @Index(name = "idx_return_user_id", columnList = "user_id"),
        @Index(name = "idx_return_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String returnNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "items"})
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "roles", "passwordHash"})
    private User user;

    @Column(nullable = false, length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReturnStatus status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal refundAmount;

    @Column(length = 500)
    private String adminNotes;

    private LocalDateTime pickupScheduledAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum ReturnStatus {
        REQUESTED,
        APPROVED,
        PICKUP_SCHEDULED,
        RECEIVED,
        INSPECTED,
        REFUND_PENDING,
        REFUNDED,
        REJECTED
    }
}
