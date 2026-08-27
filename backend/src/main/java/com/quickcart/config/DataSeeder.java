package com.quickcart.config;

import com.quickcart.config.seeder.ProductCatalogSeeder;
import com.quickcart.config.seeder.StoreAndRestaurantSeeder;
import com.quickcart.config.seeder.UserDataSeeder;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    @Value("${quickcart.demo.seeding-enabled:true}")
    private boolean seedingEnabled;

    @Value("${quickcart.demo.admin-password:}")
    private String adminPassword;

    @Value("${quickcart.demo.driver-password:}")
    private String driverPassword;

    @Value("${quickcart.demo.customer-password:}")
    private String customerPassword;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    private final StoreAndRestaurantSeeder storeAndRestaurantSeeder;
    private final UserDataSeeder userDataSeeder;
    private final ProductCatalogSeeder productCatalogSeeder;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedingEnabled) {
            logger.info("Demo data seeding is disabled by configuration.");
            return;
        }

        // Security check: Guard against missing credentials when seeding is enabled in non-test environments
        if ((adminPassword == null || adminPassword.isBlank() ||
             driverPassword == null || driverPassword.isBlank() ||
             customerPassword == null || customerPassword.isBlank()) &&
            !"test".equalsIgnoreCase(activeProfile)) {
            throw new IllegalStateException(
                "Security Exception: Data seeding is enabled, but DEMO_ADMIN_PASSWORD, DEMO_DRIVER_PASSWORD, or DEMO_CUSTOMER_PASSWORD environment variables are missing. Refusing to seed demo accounts without explicitly configured credentials."
            );
        }

        userDataSeeder.seedRoles();
        storeAndRestaurantSeeder.seedDarkStores();
        userDataSeeder.seedUsers();
        productCatalogSeeder.seedCategoriesAndProducts();
        userDataSeeder.seedCoupons();
        storeAndRestaurantSeeder.seedRestaurants();

        logger.info("QuickCart sample data seeded successfully.");
    }
}
