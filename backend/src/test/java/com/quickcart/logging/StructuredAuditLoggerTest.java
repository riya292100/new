package com.quickcart.logging;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class StructuredAuditLoggerTest {

    private StructuredAuditLogger auditLogger;
    private ErrorTracker errorTracker;

    @BeforeEach
    void setUp() {
        auditLogger = new StructuredAuditLogger();
        errorTracker = new ErrorTracker();
        MDC.put("correlationId", "test-corr-12345");
        MDC.put("userId", "101");
    }

    @Test
    @DisplayName("Should log structured audit event without exception")
    void shouldLogStructuredEvent() {
        assertDoesNotThrow(() -> auditLogger.logEvent(
                "ORDER_LIFECYCLE",
                "CHECKOUT",
                "SUCCESS",
                Map.of("orderNumber", "QC9988", "totalAmount", 450.0)
        ));
    }

    @Test
    @DisplayName("Should log security event without exception")
    void shouldLogSecurityEvent() {
        assertDoesNotThrow(() -> auditLogger.logSecurityEvent(
                "LOGIN_ATTEMPT",
                "SUCCESS",
                "admin@quickcart.com",
                "Admin console access"
        ));
    }

    @Test
    @DisplayName("Should log financial transaction without exception")
    void shouldLogFinancialTransaction() {
        assertDoesNotThrow(() -> auditLogger.logFinancialTransaction(
                "QC9988",
                "WALLET_DEBIT",
                "150.00",
                "COMPLETED"
        ));
    }

    @Test
    @DisplayName("Should track exception and business warning in ErrorTracker")
    void shouldTrackExceptionAndWarning() {
        assertDoesNotThrow(() -> errorTracker.trackException(
                "DATABASE_TIMEOUT",
                "Failed to acquire connection",
                new RuntimeException("Connection timeout"),
                Map.of("retryCount", 3)
        ));

        assertDoesNotThrow(() -> errorTracker.trackBusinessWarning(
                "INSUFFICIENT_FUNDS",
                "Customer wallet balance lower than required deduction",
                Map.of("required", 200, "balance", 50)
        ));
    }
}
