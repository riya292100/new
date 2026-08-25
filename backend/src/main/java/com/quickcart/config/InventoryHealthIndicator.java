package com.quickcart.config;

import com.quickcart.repository.ProductRepository;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/**
 * Custom Actuator Health Indicator for store inventory and replenishment health.
 */
@Component
public class InventoryHealthIndicator implements HealthIndicator {

    private final ProductRepository productRepository;

    public InventoryHealthIndicator(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public Health health() {
        try {
            long totalActiveProducts = productRepository.count();
            int lowStockCount = productRepository.findLowStockProducts().size();

            Health.Builder builder = new Health.Builder();
            builder.withDetail("totalCatalogItems", totalActiveProducts)
                   .withDetail("lowStockItemsCount", lowStockCount)
                   .withDetail("storeStatus", "OPERATIONAL");

            if (lowStockCount > 100) {
                return builder.status("WARNING")
                              .withDetail("warning", "High volume of low-stock items detected")
                              .build();
            }

            return builder.up().build();
        } catch (Exception e) {
            return Health.down()
                         .withDetail("error", "Failed to compute inventory health: " + e.getMessage())
                         .build();
        }
    }
}
