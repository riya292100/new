package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Data Quality Audit Log Table.
 * Records the outcome of data validation runs and integrity checks across the database.
 */
@Entity
@Table(name = "data_quality_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataQualityReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pipeline_name", nullable = false)
    private String pipelineName;

    @Column(name = "records_audited", nullable = false)
    private Long recordsAudited;

    @Column(name = "anomalies_found", nullable = false)
    private Integer anomaliesFound;

    @Column(name = "status", nullable = false)
    private String status; // PASSED, WARNING, FAILED

    @Column(name = "details", length = 2048)
    private String details;

    @Column(name = "execution_duration_ms", nullable = false)
    private Long executionDurationMs;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
