package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_alerts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Integer riskScore;

    @Column(nullable = false, length = 100)
    private String riskFactor;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String status = "PENDING_REVIEW"; // PENDING_REVIEW, RESOLVED, DISMISSED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
