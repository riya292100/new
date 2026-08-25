package com.quickcart.service;

import com.quickcart.dto.PaymentVerifyRequest;
import com.quickcart.entity.*;
import com.quickcart.exception.BadRequestException;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.PaymentRepository;
import com.quickcart.repository.RefundRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentGatewayServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private RefundRepository refundRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PaymentGatewayService paymentGatewayService;

    private Order testOrder;
    private Payment testPayment;
    private User testUser;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentGatewayService, "paymentSecret", "test_secret_key_123");

        testUser = User.builder()
                .id(1L)
                .email("john@example.com")
                .fullName("John Doe")
                .build();

        testOrder = Order.builder()
                .id(100L)
                .orderNumber("QC99887766")
                .user(testUser)
                .totalAmount(BigDecimal.valueOf(450.0))
                .status(OrderStatus.PLACED)
                .build();

        testPayment = Payment.builder()
                .id(50L)
                .order(testOrder)
                .transactionId("TXN-1234567890AB")
                .amount(BigDecimal.valueOf(450.0))
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        testOrder.setPayment(testPayment);
    }

    @Test
    @DisplayName("Should verify valid mock signature successfully")
    void shouldVerifyMockSignature() {
        assertTrue(paymentGatewayService.verifySignature("order_123", "pay_123", "mock_signature"));
        assertTrue(paymentGatewayService.verifySignature("order_123", "pay_123", "mock_sig_valid"));
    }

    @Test
    @DisplayName("Should reject invalid signature")
    void shouldRejectInvalidSignature() {
        assertFalse(paymentGatewayService.verifySignature("order_123", "pay_123", "invalid_signature_xyz"));
        assertFalse(paymentGatewayService.verifySignature("order_123", "pay_123", ""));
    }

    @Test
    @DisplayName("Should process payment verification and mark completed")
    void shouldProcessPaymentVerification() {
        PaymentVerifyRequest request = PaymentVerifyRequest.builder()
                .orderId(100L)
                .transactionId("TXN-1234567890AB")
                .gatewayOrderId("order_123")
                .gatewayPaymentId("pay_123")
                .gatewaySignature("mock_sig_123")
                .build();

        when(paymentRepository.findByTransactionId("TXN-1234567890AB")).thenReturn(Optional.of(testPayment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        boolean verified = paymentGatewayService.processPaymentVerification(request);

        assertTrue(verified);
        assertEquals(PaymentStatus.COMPLETED, testPayment.getPaymentStatus());
        verify(notificationService, times(1)).createNotification(eq(1L), anyString(), anyString(), eq("PAYMENT"), eq("QC99887766"));
    }

    @Test
    @DisplayName("Should initiate refund successfully and update payment status")
    void shouldInitiateRefundSuccessfully() {
        testPayment.setPaymentStatus(PaymentStatus.COMPLETED);

        when(orderRepository.findByOrderNumber("QC99887766")).thenReturn(Optional.of(testOrder));
        when(refundRepository.save(any(Refund.class))).thenAnswer(i -> i.getArgument(0));

        Refund refund = paymentGatewayService.initiateRefund("QC99887766", BigDecimal.valueOf(450.0), "Customer requested return");

        assertNotNull(refund);
        assertEquals(BigDecimal.valueOf(450.0), refund.getAmount());
        assertEquals("PROCESSED", refund.getStatus());
        assertEquals(PaymentStatus.REFUNDED, testPayment.getPaymentStatus());
        verify(notificationService, times(1)).createNotification(eq(1L), anyString(), anyString(), eq("PAYMENT"), anyString());
    }
}
