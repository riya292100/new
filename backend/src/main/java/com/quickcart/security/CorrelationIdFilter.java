package com.quickcart.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Intercepts incoming HTTP requests to establish distributed correlation tracking.
 * Injects correlation ID, trace ID, user ID, and IP into SLF4J MDC context and HTTP response headers.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    public static final String REQUEST_ID_HEADER = "X-Request-ID";
    public static final String RESPONSE_TIME_HEADER = "X-Response-Time-Millis";

    public static final String MDC_CORRELATION_ID = "correlationId";
    public static final String MDC_TRACE_ID = "traceId";
    public static final String MDC_USER_ID = "userId";
    public static final String MDC_CLIENT_IP = "clientIp";
    public static final String MDC_HTTP_METHOD = "httpMethod";
    public static final String MDC_REQUEST_URI = "requestUri";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long startTime = System.currentTimeMillis();

        try {
            // Extract or generate correlation ID
            String correlationId = request.getHeader(CORRELATION_ID_HEADER);
            if (!StringUtils.hasText(correlationId)) {
                correlationId = request.getHeader("X-Correlation-Id");
            }
            if (!StringUtils.hasText(correlationId)) {
                correlationId = request.getHeader(REQUEST_ID_HEADER);
            }
            if (!StringUtils.hasText(correlationId)) {
                correlationId = UUID.randomUUID().toString();
            }

            // Extract client IP (handling reverse proxies)
            String clientIp = request.getHeader("X-Forwarded-For");
            if (!StringUtils.hasText(clientIp) || "unknown".equalsIgnoreCase(clientIp)) {
                clientIp = request.getRemoteAddr();
            } else if (clientIp.contains(",")) {
                clientIp = clientIp.split(",")[0].trim();
            }

            // Populate MDC
            MDC.put(MDC_CORRELATION_ID, correlationId);
            MDC.put(MDC_TRACE_ID, correlationId.replace("-", "").substring(0, Math.min(16, correlationId.length())));
            MDC.put(MDC_CLIENT_IP, clientIp != null ? clientIp : "UNKNOWN");
            MDC.put(MDC_HTTP_METHOD, request.getMethod());
            MDC.put(MDC_REQUEST_URI, request.getRequestURI());

            // Extract Authenticated User ID if present
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                MDC.put(MDC_USER_ID, auth.getName());
            } else {
                MDC.put(MDC_USER_ID, "ANON");
            }

            // Attach correlation ID to response headers
            response.setHeader(CORRELATION_ID_HEADER, correlationId);
            response.setHeader("X-Correlation-Id", correlationId);

            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            response.setHeader(RESPONSE_TIME_HEADER, String.valueOf(duration));
            MDC.clear();
        }
    }
}
