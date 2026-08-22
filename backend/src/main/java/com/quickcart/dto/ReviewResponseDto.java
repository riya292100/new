package com.quickcart.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDto {
    private Long id;
    private Long productId;
    private String productName;
    private Long userId;
    private String userName;
    private String userAvatar;
    private Long orderId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
