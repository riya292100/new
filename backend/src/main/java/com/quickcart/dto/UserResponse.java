package com.quickcart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    @Builder.Default
    private Boolean isActive = true;
    private List<String> roles;
    private LocalDateTime createdAt;

    public UserResponse(Long id, String fullName, String email, String phone, String avatarUrl, List<String> roles, LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.avatarUrl = avatarUrl;
        this.isActive = true;
        this.roles = roles;
        this.createdAt = createdAt;
    }
}
