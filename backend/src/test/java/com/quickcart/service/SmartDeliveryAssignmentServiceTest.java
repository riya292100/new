package com.quickcart.service;

import com.quickcart.entity.*;
import com.quickcart.event.DomainEventPublisher;
import com.quickcart.repository.DeliveryAssignmentRepository;
import com.quickcart.repository.DeliveryPartnerRepository;
import com.quickcart.repository.DeliveryZoneRepository;
import com.quickcart.repository.OrderRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SmartDeliveryAssignmentServiceTest {

    @Mock
    private DeliveryPartnerRepository deliveryPartnerRepository;

    @Mock
    private DeliveryAssignmentRepository deliveryAssignmentRepository;

    @Mock
    private DeliveryZoneRepository deliveryZoneRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private DomainEventPublisher domainEventPublisher;

    @InjectMocks
    private SmartDeliveryAssignmentService deliveryAssignmentService;

    private DeliveryPartner partnerHighRating;
    private DeliveryPartner partnerLowRating;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        User u1 = User.builder().id(101L).fullName("Fast Runner").phone("9876543210").build();
        User u2 = User.builder().id(102L).fullName("Slow Walker").phone("9876543211").build();

        partnerHighRating = DeliveryPartner.builder()
                .id(1L)
                .user(u1)
                .isAvailable(true)
                .rating(BigDecimal.valueOf(4.9))
                .build();

        partnerLowRating = DeliveryPartner.builder()
                .id(2L)
                .user(u2)
                .isAvailable(true)
                .rating(BigDecimal.valueOf(3.2))
                .build();

        Address dest = Address.builder().pincode("560001").build();
        testOrder = Order.builder().id(500L).orderNumber("QC123456").address(dest).build();
    }

    @Test
    @DisplayName("Allocates partner with highest suitability score")
    void testAllocateBestPartner() {
        when(deliveryPartnerRepository.findByIsAvailableTrue()).thenReturn(List.of(partnerLowRating, partnerHighRating));
        when(deliveryAssignmentRepository.findByOrderId(500L)).thenReturn(Optional.empty());

        Optional<DeliveryPartner> allocated = deliveryAssignmentService.allocateBestPartner(testOrder);

        assertTrue(allocated.isPresent());
        assertEquals(1L, allocated.get().getId());
        assertEquals("Fast Runner", allocated.get().getUser().getFullName());
        verify(deliveryAssignmentRepository).save(any(DeliveryAssignment.class));
        verify(domainEventPublisher).publish(any());
    }

    @Test
    @DisplayName("Returns empty when no online delivery partners are active")
    void testAllocateWhenNoPartnersOnline() {
        when(deliveryPartnerRepository.findByIsAvailableTrue()).thenReturn(List.of());

        Optional<DeliveryPartner> allocated = deliveryAssignmentService.allocateBestPartner(testOrder);

        assertTrue(allocated.isEmpty());
        verify(deliveryAssignmentRepository, never()).save(any());
    }
}
