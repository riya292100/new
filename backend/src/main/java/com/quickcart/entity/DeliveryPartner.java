package com.quickcart.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@Table(name = "delivery_partners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"roles", "passwordHash", "createdAt", "updatedAt"})
    private User user;

    @Column(length = 50)
    private String vehicleType = "ELECTRIC_SCOOTER";

    @Column(length = 50)
    private String vehicleNumber;

    @Column(length = 50)
    private String drivingLicenseNumber;

    @Column(precision = 10, scale = 8)
    private BigDecimal currentLatitude = BigDecimal.valueOf(28.6139);

    @Column(precision = 11, scale = 8)
    private BigDecimal currentLongitude = BigDecimal.valueOf(77.2090);

    private Boolean isAvailable = true;

    @Column(precision = 2, scale = 1)
    private BigDecimal rating = BigDecimal.valueOf(4.9);

    private Integer totalDeliveries = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public DeliveryPartner(User user, String vehicleType, String vehicleNumber) {
        this.user = user;
        this.vehicleType = vehicleType;
        this.vehicleNumber = vehicleNumber;
        this.isAvailable = true;
    }
}
