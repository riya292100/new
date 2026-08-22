package com.quickcart.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private Boolean isActive;
    private List<String> roles;
    private LocalDateTime createdAt;
}
