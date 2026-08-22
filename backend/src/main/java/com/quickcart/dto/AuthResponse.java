package com.quickcart.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private List<String> roles;

    public AuthResponse(String token, Long id, String fullName, String email, String phone, String avatarUrl, List<String> roles) {
        this.token = token;
        this.type = "Bearer";
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.avatarUrl = avatarUrl;
        this.roles = roles;
    }
}
