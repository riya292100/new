package com.quickcart.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantReviewDto {
    private Long id;
    private Long restaurantId;
    private Long userId;
    private String userName;
    private Integer rating;
    private String title;
    private String comment;
    private LocalDateTime createdAt;
}
