package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.BuildProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Health and Observability Controller
 * Exposes explicit /health, /api/health, /health/liveness, and /health/readiness endpoints.
 */
@RestController
public class HealthController {

    @Autowired(required = false)
    private DataSource dataSource;

    @Autowired(required = false)
    private BuildProperties buildProperties;

    @GetMapping({"/health", "/api/health"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", Instant.now().toString());
        health.put("version", buildProperties != null ? buildProperties.getVersion() : "1.2.0");
        health.put("service", "quickcart-backend");

        boolean dbUp = checkDatabaseHealth();
        health.put("database", dbUp ? "UP" : "DOWN");

        return ResponseEntity.ok(ApiResponse.success(health));
    }

    @GetMapping({"/health/liveness", "/api/health/liveness"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLiveness() {
        Map<String, Object> liveness = new HashMap<>();
        liveness.put("status", "UP");
        liveness.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(ApiResponse.success(liveness));
    }

    @GetMapping({"/health/readiness", "/api/health/readiness"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReadiness() {
        boolean dbHealthy = checkDatabaseHealth();
        Map<String, Object> readiness = new HashMap<>();
        readiness.put("timestamp", Instant.now().toString());

        if (dbHealthy) {
            readiness.put("status", "UP");
            readiness.put("database", "UP");
            return ResponseEntity.ok(ApiResponse.success(readiness));
        } else {
            readiness.put("status", "DOWN");
            readiness.put("database", "DOWN");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ApiResponse<>(false, "Service is not ready: Database connection failed", readiness));
        }
    }

    private boolean checkDatabaseHealth() {
        if (dataSource == null) {
            return true; // Embedded or mock datasource
        }
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(2);
        } catch (Exception e) {
            return false;
        }
    }
}
