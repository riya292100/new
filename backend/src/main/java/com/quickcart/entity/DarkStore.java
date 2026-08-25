package com.quickcart.entity;

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

@Entity
@Table(name = "dark_stores")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DarkStore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // e.g., "HUB-BLR-01"

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 20)
    private String pincode;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @Builder.Default
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal radiusKm = BigDecimal.valueOf(10.0);

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(length = 50)
    private String operatingHours = "06:00 - 23:30";

    @Builder.Default
    @Column(nullable = false)
    private Integer maxCapacityOrdersPerHour = 100;

    @Builder.Default
    @Column(nullable = false)
    private Integer currentOrderLoad = 0;

    @Column(length = 100)
    private String managerEmail;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public boolean isWithinOperatingHours() {
        // Default 24/7 or parse standard window
        if (operatingHours == null || operatingHours.isBlank()) return true;
        try {
            String[] parts = operatingHours.split("-");
            if (parts.length == 2) {
                java.time.LocalTime start = java.time.LocalTime.parse(parts[0].trim());
                java.time.LocalTime end = java.time.LocalTime.parse(parts[1].trim());
                java.time.LocalTime now = java.time.LocalTime.now();
                return (now.isAfter(start) || now.equals(start)) && (now.isBefore(end) || now.equals(end));
            }
        } catch (Exception _e) {
            return true;
        }
        return true;
    }
}
