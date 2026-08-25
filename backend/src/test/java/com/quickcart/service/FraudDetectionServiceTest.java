package com.quickcart.service;

import com.quickcart.entity.FraudAlert;
import com.quickcart.entity.Order;
import com.quickcart.entity.OrderStatus;
import com.quickcart.entity.Payment;
import com.quickcart.entity.PaymentStatus;
import com.quickcart.entity.User;
import com.quickcart.repository.FraudAlertRepository;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FraudDetectionServiceTest {

    @Mock
    private FraudAlertRepository fraudAlertRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private FraudDetectionService fraudDetectionService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(10L)
                .email("shopper@quickcart.com")
                .fullName("Quick Shopper")
                .build();
    }

    @Test
    @DisplayName("Flags alert when user has excessive order cancellations in 24 hours")
    void testExcessiveCancellationsFlagged() {
        Order o1 = Order.builder().status(OrderStatus.CANCELLED).createdAt(LocalDateTime.now().minusHours(2)).build();
        Order o2 = Order.builder().status(OrderStatus.CANCELLED).createdAt(LocalDateTime.now().minusHours(5)).build();
        Order o3 = Order.builder().status(OrderStatus.CANCELLED).createdAt(LocalDateTime.now().minusHours(8)).build();

        when(orderRepository.findByUserIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(o1, o2, o3));
        when(paymentRepository.findAll()).thenReturn(List.of());

        fraudDetectionService.evaluateUserRisk(10L, "Order Cancel Request");

        ArgumentCaptor<FraudAlert> captor = ArgumentCaptor.forClass(FraudAlert.class);
        verify(fraudAlertRepository, atLeastOnce()).save(captor.capture());

        FraudAlert alert = captor.getValue();
        assertEquals(10L, alert.getUserId());
        assertEquals("EXCESSIVE_CANCELLATIONS", alert.getRiskFactor());
        assertEquals("PENDING_REVIEW", alert.getStatus());
        assertTrue(alert.getRiskScore() >= 70);
    }

    @Test
    @DisplayName("Flags alert when user has spike of failed payments in last hour")
    void testFailedPaymentSpikeFlagged() {
        Order order = Order.builder().id(100L).user(testUser).status(OrderStatus.CREATED).createdAt(LocalDateTime.now()).build();

        Payment p1 = Payment.builder().order(order).paymentStatus(PaymentStatus.FAILED).createdAt(LocalDateTime.now().minusMinutes(10)).build();
        Payment p2 = Payment.builder().order(order).paymentStatus(PaymentStatus.FAILED).createdAt(LocalDateTime.now().minusMinutes(20)).build();
        Payment p3 = Payment.builder().order(order).paymentStatus(PaymentStatus.FAILED).createdAt(LocalDateTime.now().minusMinutes(30)).build();

        when(orderRepository.findByUserIdOrderByCreatedAtDesc(10L)).thenReturn(List.of());
        when(paymentRepository.findAll()).thenReturn(List.of(p1, p2, p3));

        fraudDetectionService.evaluateUserRisk(10L, "Checkout Attempt");

        ArgumentCaptor<FraudAlert> captor = ArgumentCaptor.forClass(FraudAlert.class);
        verify(fraudAlertRepository, atLeastOnce()).save(captor.capture());

        FraudAlert alert = captor.getValue();
        assertEquals(10L, alert.getUserId());
        assertEquals("FAILED_PAYMENT_SPIKE", alert.getRiskFactor());
        assertTrue(alert.getRiskScore() >= 80);
    }
}
