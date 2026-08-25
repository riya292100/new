package com.quickcart.service;

import com.quickcart.dto.DeliveryZoneDto;
import com.quickcart.entity.DeliveryZone;
import com.quickcart.repository.DeliveryZoneRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeliveryZoneServiceTest {

    @Mock
    private DeliveryZoneRepository deliveryZoneRepository;

    @InjectMocks
    private DeliveryZoneService deliveryZoneService;

    private DeliveryZone testZone;

    @BeforeEach
    void setUp() {
        testZone = DeliveryZone.builder()
                .id(10L)
                .zoneCode("ZONE-BLR-01")
                .name("Koramangala 100ft Hub")
                .city("Bengaluru")
                .centerLatitude(BigDecimal.valueOf(12.9352))
                .centerLongitude(BigDecimal.valueOf(77.6245))
                .radiusKm(BigDecimal.valueOf(8.0))
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Should return all active delivery zones")
    void shouldReturnAllActiveZones() {
        when(deliveryZoneRepository.findByIsActiveTrue()).thenReturn(List.of(testZone));

        List<DeliveryZoneDto> zones = deliveryZoneService.getAllZones();

        assertNotNull(zones);
        assertEquals(1, zones.size());
        assertEquals("ZONE-BLR-01", zones.get(0).getZoneCode());
    }

    @Test
    @DisplayName("Should fetch zone details by id")
    void shouldFetchZoneDetails() {
        when(deliveryZoneRepository.findById(10L)).thenReturn(Optional.of(testZone));

        DeliveryZoneDto dto = deliveryZoneService.getZoneById(10L);

        assertNotNull(dto);
        assertEquals("ZONE-BLR-01", dto.getZoneCode());
        assertEquals("Koramangala 100ft Hub", dto.getName());
    }
}
