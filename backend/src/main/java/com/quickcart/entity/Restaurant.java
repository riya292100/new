package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "restaurants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String cuisine; // e.g. Italian, Japanese, Indian, French, Mediterranean, Mexican

    @Column(nullable = false)
    private String country; // e.g. Italy, Japan, USA, France, UK, India

    @Column(nullable = false)
    private String city; // e.g. Rome, Tokyo, New York, Paris, London, Kolkata, Bengaluru

    @Column(nullable = false)
    private String address;

    private Double latitude;
    private Double longitude;

    private Double rating; // e.g. 4.8
    private Integer reviewCount; // e.g. 142
    private String priceLevel; // $, $$, $$$, $$$$

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String galleryImages; // comma-separated URLs

    private String openingHours; // e.g. "11:00 AM - 11:00 PM"
    private String phone;
    private String website;

    @Builder.Default
    private Boolean isVegetarianFriendly = true;

    @Builder.Default
    private Boolean isVeganFriendly = false;

    @Builder.Default
    private Boolean isDineInAvailable = true;

    @Builder.Default
    private Boolean isDeliveryAvailable = true;

    @Builder.Default
    private Boolean isTakeawayAvailable = true;

    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
