package com.quickcart.controller;

import com.quickcart.dto.*;
import com.quickcart.security.UserDetailsImpl;
import com.quickcart.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration, login, token refresh, and password management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login with email and password to receive JWT access token and refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.authenticateUser(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new customer, store manager, or delivery partner account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.registerUser(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Exchange a valid refresh token for a new JWT access token")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        TokenRefreshResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and invalidate active refresh tokens")
    public ResponseEntity<ApiResponse<Void>> logout() {
        authService.logoutUser();
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset user account password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset token for the specified email")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String token = authService.initiatePasswordReset(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset instructions dispatched", token));
    }

    @PostMapping("/reset-password-confirm")
    @Operation(summary = "Confirm password reset using verification token")
    public ResponseEntity<ApiResponse<Void>> resetPasswordConfirm(@Valid @RequestBody ResetPasswordWithTokenRequest request) {
        authService.completePasswordResetWithToken(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset confirmed successfully", null));
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify account email using token")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.completeEmailVerification(request);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully", null));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend email verification token")
    public ResponseEntity<ApiResponse<String>> resendVerification(@Valid @RequestBody ForgotPasswordRequest request) {
        String token = authService.initiateEmailVerification(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Verification token generated", token));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        UserDetailsImpl user = authService.getCurrentAuthenticatedUser();
        UserResponse response = authService.getUserProfile(user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
