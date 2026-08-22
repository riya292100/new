package com.quickcart.controller;

import com.quickcart.dto.*;
import com.quickcart.entity.User;
import com.quickcart.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration, login, and profile")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login with email and password to receive JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.authenticateUser(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new customer or delivery partner account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.registerUser(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        User user = authService.getCurrentAuthenticatedUser();
        UserResponse response = authService.getUserProfile(user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
