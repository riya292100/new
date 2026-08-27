package com.quickcart.security.secrets;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class SecretManagerServiceTest {

    private SecretManagerService secretManager;

    @BeforeEach
    void setUp() {
        secretManager = new SecretManagerService();
    }

    @Test
    @DisplayName("Should return default value when secret is not configured")
    void shouldReturnDefaultValue() {
        String secret = secretManager.getSecret("NON_EXISTENT_KEY_123", "default_secret_fallback");
        assertEquals("default_secret_fallback", secret);
    }

    @Test
    @DisplayName("Should support secret caching and manual rotation")
    void shouldSupportRotation() {
        secretManager.rotateSecret("JWT_SIGNING_KEY", "new_rotated_secure_key_5678");

        Optional<String> secret = secretManager.getSecret("JWT_SIGNING_KEY");
        assertTrue(secret.isPresent());
        assertEquals("new_rotated_secure_key_5678", secret.get());
    }

    @Test
    @DisplayName("Should throw IllegalStateException when required secret is missing")
    void shouldThrowWhenRequiredSecretMissing() {
        assertThrows(IllegalStateException.class, () ->
                secretManager.getRequiredSecret("MISSING_CRITICAL_DB_KEY_9999"));
    }
}
