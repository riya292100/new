package com.quickcart.config;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.sql.Connection;

/**
 * Enterprise Custom Health Indicator for QuickCart core services.
 * Monitored via GET /actuator/health
 */
@Component
public class QuickCartHealthIndicator implements HealthIndicator {

    private final DataSource dataSource;

    public QuickCartHealthIndicator(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public Health health() {
        Health.Builder builder = new Health.Builder();
        boolean isDbHealthy = checkDatabase();

        MemoryMXBean memoryMXBean = ManagementFactory.getMemoryMXBean();
        long heapUsedMb = memoryMXBean.getHeapMemoryUsage().getUsed() / (1024 * 1024);
        long heapMaxMb = memoryMXBean.getHeapMemoryUsage().getMax() / (1024 * 1024);

        builder.withDetail("service", "quickcart-core-engine")
               .withDetail("version", "2.0.0-PROD")
               .withDetail("databaseConnected", isDbHealthy)
               .withDetail("heapUsedMb", heapUsedMb + " MB")
               .withDetail("heapMaxMb", heapMaxMb + " MB");

        if (isDbHealthy) {
            return builder.up().build();
        } else {
            return builder.down().withDetail("error", "Database connection verification failed").build();
        }
    }

    private boolean checkDatabase() {
        try (Connection conn = dataSource.getConnection()) {
            return conn.isValid(2);
        } catch (Exception e) {
            return false;
        }
    }
}
