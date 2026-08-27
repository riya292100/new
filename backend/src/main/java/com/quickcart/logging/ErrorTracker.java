package com.quickcart.logging;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

/**
 * Enterprise Application Error & Exception Tracking Service.
 * Formats uncaught exceptions and business failures with correlation context and structured error codes.
 */
@Component
@Slf4j
public class ErrorTracker {

    public void trackException(String errorCode, String message, Throwable throwable, Map<String, Object> context) {
        String correlationId = MDC.get("correlationId");
        String userId = MDC.get("userId");

        StringBuilder sb = new StringBuilder();
        sb.append("{")
          .append("\"timestamp\":\"").append(Instant.now()).append("\", ")
          .append("\"severity\":\"ERROR\", ")
          .append("\"errorCode\":\"").append(errorCode != null ? errorCode : "INTERNAL_ERROR").append("\", ")
          .append("\"message\":\"").append(message != null ? escapeJson(message) : "").append("\", ")
          .append("\"exceptionClass\":\"").append(throwable != null ? throwable.getClass().getName() : "None").append("\", ")
          .append("\"correlationId\":\"").append(correlationId != null ? correlationId : "none").append("\", ")
          .append("\"userId\":\"").append(userId != null ? userId : "ANON").append("\"");

        if (context != null && !context.isEmpty()) {
            sb.append(", \"context\":{");
            int i = 0;
            for (Map.Entry<String, Object> entry : context.entrySet()) {
                if (i > 0) sb.append(", ");
                sb.append("\"").append(escapeJson(entry.getKey())).append("\":\"")
                  .append(escapeJson(String.valueOf(entry.getValue()))).append("\"");
                i++;
            }
            sb.append("}");
        }
        sb.append("}");

        if (throwable != null) {
            log.error("{}", sb.toString(), throwable);
        } else {
            log.error("{}", sb.toString());
        }
    }

    public void trackBusinessWarning(String code, String message, Map<String, Object> context) {
        String correlationId = MDC.get("correlationId");
        log.warn("BUSINESS_RULE_VIOLATION [code={}, corr={}] - {} | Context: {}",
                code, correlationId != null ? correlationId : "none", message, context);
    }

    private String escapeJson(String raw) {
        if (raw == null) return "";
        return raw.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ").replace("\r", " ");
    }
}
