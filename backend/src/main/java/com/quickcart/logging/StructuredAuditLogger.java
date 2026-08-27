package com.quickcart.logging;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

/**
 * Enterprise Structured JSON Audit Logger.
 * Emits uniform structured JSON logs with correlation IDs, user context, and operational metadata.
 */
@Component
@Slf4j
public class StructuredAuditLogger {

    public void logEvent(String eventType, String action, String outcome, Map<String, Object> details) {
        String correlationId = MDC.get("correlationId");
        String userId = MDC.get("userId");

        StringBuilder sb = new StringBuilder();
        sb.append("{")
          .append("\"timestamp\":\"").append(Instant.now()).append("\", ")
          .append("\"eventType\":\"").append(escapeJson(eventType)).append("\", ")
          .append("\"action\":\"").append(escapeJson(action)).append("\", ")
          .append("\"outcome\":\"").append(escapeJson(outcome)).append("\", ")
          .append("\"correlationId\":\"").append(correlationId != null ? correlationId : "none").append("\", ")
          .append("\"userId\":\"").append(userId != null ? userId : "ANON").append("\"");

        if (details != null && !details.isEmpty()) {
            sb.append(", \"details\":{");
            int i = 0;
            for (Map.Entry<String, Object> entry : details.entrySet()) {
                if (i > 0) sb.append(", ");
                sb.append("\"").append(escapeJson(entry.getKey())).append("\":\"")
                  .append(escapeJson(String.valueOf(entry.getValue()))).append("\"");
                i++;
            }
            sb.append("}");
        }
        sb.append("}");

        log.info("{}", sb.toString());
    }

    public void logSecurityEvent(String action, String outcome, String actor, String details) {
        logEvent("SECURITY_AUDIT", action, outcome, Map.of("actor", actor != null ? actor : "UNKNOWN", "info", details != null ? details : ""));
    }

    public void logFinancialTransaction(String orderNumber, String type, String amount, String status) {
        logEvent("FINANCIAL_LEDGER", type, status, Map.of("orderNumber", orderNumber, "amount", amount));
    }

    private String escapeJson(String raw) {
        if (raw == null) return "";
        return raw.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ").replace("\r", " ");
    }
}
