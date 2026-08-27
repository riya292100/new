package com.quickcart.config;

import com.quickcart.config.seeder.ProductCatalogSeeder;
import com.quickcart.config.seeder.StoreAndRestaurantSeeder;
import com.quickcart.config.seeder.UserDataSeeder;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataSeederTest {

    @Mock
    private StoreAndRestaurantSeeder storeAndRestaurantSeeder;

    @Mock
    private UserDataSeeder userDataSeeder;

    @Mock
    private ProductCatalogSeeder productCatalogSeeder;

    @InjectMocks
    private DataSeeder dataSeeder;

    @Test
    @DisplayName("run - skips seeding when seedingEnabled is false")
    void run_WhenSeedingDisabled_SkipsSeeding() {
        ReflectionTestUtils.setField(dataSeeder, "seedingEnabled", false);

        dataSeeder.run();

        verifyNoInteractions(userDataSeeder, storeAndRestaurantSeeder, productCatalogSeeder);
    }

    @Test
    @DisplayName("run - seeds sample data when passwords are provided")
    void run_WhenPasswordsProvided_SeedsSuccessfully() {
        ReflectionTestUtils.setField(dataSeeder, "seedingEnabled", true);
        ReflectionTestUtils.setField(dataSeeder, "adminPassword", "SecureAdmin@123");
        ReflectionTestUtils.setField(dataSeeder, "driverPassword", "SecureDriver@123");
        ReflectionTestUtils.setField(dataSeeder, "customerPassword", "SecureCustomer@123");
        ReflectionTestUtils.setField(dataSeeder, "activeProfile", "dev");

        assertDoesNotThrow(() -> dataSeeder.run());

        verify(userDataSeeder).seedRoles();
        verify(storeAndRestaurantSeeder).seedDarkStores();
        verify(userDataSeeder).seedUsers();
        verify(productCatalogSeeder).seedCategoriesAndProducts();
        verify(userDataSeeder).seedCoupons();
        verify(storeAndRestaurantSeeder).seedRestaurants();
    }

    @Test
    @DisplayName("run - throws IllegalStateException when passwords missing in non-test profile")
    void run_WhenPasswordsMissingInNonTestProfile_ThrowsSecurityException() {
        ReflectionTestUtils.setField(dataSeeder, "seedingEnabled", true);
        ReflectionTestUtils.setField(dataSeeder, "adminPassword", "");
        ReflectionTestUtils.setField(dataSeeder, "driverPassword", null);
        ReflectionTestUtils.setField(dataSeeder, "customerPassword", "");
        ReflectionTestUtils.setField(dataSeeder, "activeProfile", "prod");

        assertThrows(IllegalStateException.class, () -> dataSeeder.run());
    }

    @Test
    @DisplayName("run - allows test profile to proceed with fallback test values")
    void run_WhenTestProfile_DoesNotThrow() {
        ReflectionTestUtils.setField(dataSeeder, "seedingEnabled", true);
        ReflectionTestUtils.setField(dataSeeder, "adminPassword", "");
        ReflectionTestUtils.setField(dataSeeder, "driverPassword", "");
        ReflectionTestUtils.setField(dataSeeder, "customerPassword", "");
        ReflectionTestUtils.setField(dataSeeder, "activeProfile", "test");

        assertDoesNotThrow(() -> dataSeeder.run());

        verify(userDataSeeder).seedRoles();
    }
}
