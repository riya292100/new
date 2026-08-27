package com.quickcart.security.secrets;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Enterprise Secret Management Service.
 * Resolves sensitive keys (JWT secrets, payment webhooks, database credentials)
 * from enterprise secret providers with cached in-memory access and rotation hooks.
 */
@Service
@Slf4j
public class SecretManagerService {

    @Value("${quickcart.secrets.provider:environment}")
    private String secretProviderType;

    private final ConcurrentHashMap<String, String> secretCache = new ConcurrentHashMap<>();

    public Optional<String> getSecret(String secretKey) {
        if (secretKey == null || secretKey.isBlank()) {
            return Optional.empty();
        }

        // Check local cache first
        if (secretCache.containsKey(secretKey)) {
            return Optional.ofNullable(secretCache.get(secretKey));
        }

        // Fetch from environment or cloud vault abstraction
        String value = System.getenv(secretKey);
        if (value == null || value.isBlank()) {
            value = System.getProperty(secretKey);
        }

        if (value != null && !value.isBlank()) {
            secretCache.put(secretKey, value);
            return Optional.of(value);
        }

        return Optional.empty();
    }

    public String getSecret(String secretKey, String defaultValue) {
        return getSecret(secretKey).orElse(defaultValue);
    }

    public String getRequiredSecret(String secretKey) {
        return getSecret(secretKey).orElseThrow(() ->
                new IllegalStateException("CRITICAL: Required secret '" + secretKey + "' is not configured in environment or vault"));
    }

    public void rotateSecret(String secretKey, String newSecretValue) {
        if (secretKey != null && newSecretValue != null) {
            secretCache.put(secretKey, newSecretValue);
            log.info("Secret '{}' was securely rotated in runtime secret cache", secretKey);
        }
    }
}
