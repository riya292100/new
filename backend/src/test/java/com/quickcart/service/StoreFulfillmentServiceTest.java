package com.quickcart.service;

import com.quickcart.entity.CartItem;
import com.quickcart.entity.DarkStore;
import com.quickcart.entity.Product;
import com.quickcart.repository.DarkStoreRepository;
import com.quickcart.repository.InventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StoreFulfillmentServiceTest {

    @Mock
    private DarkStoreRepository darkStoreRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private StoreFulfillmentService storeFulfillmentService;

    private DarkStore hubKoramangala;
    private DarkStore hubIndiranagar;

    @BeforeEach
    void setUp() {
        hubKoramangala = DarkStore.builder()
                .id(1L)
                .name("Koramangala Dark Hub")
                .code("HUB-BLR-01")
                .latitude(BigDecimal.valueOf(12.9352))
                .longitude(BigDecimal.valueOf(77.6245))
                .radiusKm(BigDecimal.valueOf(10.0))
                .isActive(true)
                .maxCapacityOrdersPerHour(100)
                .currentOrderLoad(10)
                .build();

        hubIndiranagar = DarkStore.builder()
                .id(2L)
                .name("Indiranagar Dark Hub")
                .code("HUB-BLR-02")
                .latitude(BigDecimal.valueOf(12.9784))
                .longitude(BigDecimal.valueOf(77.6408))
                .radiusKm(BigDecimal.valueOf(10.0))
                .isActive(true)
                .maxCapacityOrdersPerHour(100)
                .currentOrderLoad(50)
                .build();
    }

    @Test
    @DisplayName("Should select nearest store for customer coordinates")
    void testSelectOptimalStore_Nearest() {
        when(darkStoreRepository.findByIsActiveTrue()).thenReturn(List.of(hubKoramangala, hubIndiranagar));

        // Location close to Koramangala (12.9340, 77.6200)
        BigDecimal customerLat = BigDecimal.valueOf(12.9340);
        BigDecimal customerLng = BigDecimal.valueOf(77.6200);

        Product p = Product.builder().id(10L).name("Avocado").build();
        CartItem item = CartItem.builder().product(p).quantity(2).unitPrice(BigDecimal.valueOf(100)).build();

        DarkStore selected = storeFulfillmentService.selectOptimalStore(customerLat, customerLng, List.of(item));

        assertNotNull(selected);
        assertEquals(1L, selected.getId());
        assertEquals("Koramangala Dark Hub", selected.getName());
    }

    @Test
    @DisplayName("Should calculate Haversine distance correctly")
    void testCalculateHaversineDistance() {
        // Distance between Bangalore Koramangala (12.9352, 77.6245) and Indiranagar (12.9784, 77.6408) is ~5.1 km
        double dist = storeFulfillmentService.calculateHaversineDistance(12.9352, 77.6245, 12.9784, 77.6408);
        assertTrue(dist > 4.5 && dist < 6.0, "Calculated distance should be ~5 km");
    }
}
