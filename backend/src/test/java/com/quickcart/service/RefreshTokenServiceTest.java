package com.quickcart.service;

import com.quickcart.entity.RefreshToken;
import com.quickcart.entity.User;
import com.quickcart.exception.BadRequestException;
import com.quickcart.repository.RefreshTokenRepository;
import com.quickcart.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private User testUser;
    private RefreshToken testToken;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenDurationMs", 86400000L);

        testUser = User.builder()
                .id(1L)
                .email("user@example.com")
                .fullName("Test User")
                .build();

        testToken = RefreshToken.builder()
                .id(10L)
                .user(testUser)
                .token("mock-uuid-refresh-token")
                .expiryDate(Instant.now().plusMillis(86400000L))
                .revoked(false)
                .build();
    }

    @Test
    @DisplayName("Should create refresh token for user when none exists")
    void shouldCreateRefreshToken() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(refreshTokenRepository.findByUser(testUser)).thenReturn(Optional.empty());
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));

        RefreshToken created = refreshTokenService.createRefreshToken(1L);

        assertNotNull(created);
        assertNotNull(created.getToken());
        assertEquals(testUser, created.getUser());
        assertFalse(created.getRevoked());
    }

    @Test
    @DisplayName("Should reuse and update existing refresh token for user")
    void shouldUpdateExistingRefreshToken() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(refreshTokenRepository.findByUser(testUser)).thenReturn(Optional.of(testToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));

        RefreshToken updated = refreshTokenService.createRefreshToken(1L);

        assertNotNull(updated);
        assertEquals(testToken.getId(), updated.getId());
        assertEquals(testUser, updated.getUser());
        assertFalse(updated.getRevoked());
    }

    @Test
    @DisplayName("Should verify valid token without exception")
    void shouldVerifyValidToken() {
        RefreshToken verified = refreshTokenService.verifyExpiration(testToken);
        assertEquals(testToken, verified);
    }

    @Test
    @DisplayName("Should throw BadRequestException if token is expired")
    void shouldThrowIfExpired() {
        testToken.setExpiryDate(Instant.now().minusSeconds(3600));

        assertThrows(BadRequestException.class, () -> refreshTokenService.verifyExpiration(testToken));
        verify(refreshTokenRepository, times(1)).delete(testToken);
    }

    @Test
    @DisplayName("Should throw BadRequestException if token is revoked")
    void shouldThrowIfRevoked() {
        testToken.setRevoked(true);

        assertThrows(BadRequestException.class, () -> refreshTokenService.verifyExpiration(testToken));
    }
}
