package com.quickcart.config;

import io.sentry.Sentry;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Enterprise Centralized Error Tracking Configuration (Sentry APM).
 * Initializes Sentry when SENTRY_DSN is configured in non-test profiles.
 * Gracefully deactivates during automated tests and local standalone runs without DSN.
 */
@Configuration
public class SentryConfig {

    private static final Logger log = LoggerFactory.getLogger(SentryConfig.class);

    @Value("${sentry.dsn:${SENTRY_DSN:}}")
    private String sentryDsn;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @PostConstruct
    public void init() {
        if (sentryDsn != null && !sentryDsn.trim().isEmpty() && !"test".equalsIgnoreCase(activeProfile)) {
            Sentry.init(options -> {
                options.setDsn(sentryDsn.trim());
                options.setEnvironment(activeProfile);
                options.setTracesSampleRate(1.0);
                options.setSendDefaultPii(false);
            });
            log.info("QuickCart Sentry error tracking active for environment [{}]", activeProfile);
        } else {
            log.info("QuickCart Sentry error tracking disabled (profile: {}, DSN provided: {})",
                    activeProfile, (sentryDsn != null && !sentryDsn.trim().isEmpty()));
        }
    }
}
