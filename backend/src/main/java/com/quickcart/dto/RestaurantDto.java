package com.quickcart.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantDto {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String cuisine;
    private String country;
    private String city;
    private String address;
    private Double latitude;
    private Double longitude;
    private Double rating;
    private Integer reviewCount;
    private String priceLevel;
    private String imageUrl;
    private List<String> galleryImages;
    private String openingHours;
    private String phone;
    private String website;
    private Boolean isVegetarianFriendly;
    private Boolean isVeganFriendly;
    private Boolean isDineInAvailable;
    private Boolean isDeliveryAvailable;
    private Boolean isTakeawayAvailable;
    private Boolean isFavorite;
}
