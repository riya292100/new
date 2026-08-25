package com.quickcart.service;

import com.quickcart.dto.ReconciliationReport;
import com.quickcart.entity.*;
import com.quickcart.repository.AuditLogRepository;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.PaymentRepository;
import com.quickcart.repository.RefundRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentReconciliationServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private RefundRepository refundRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private PaymentReconciliationService reconciliationService;

    @Test
    @DisplayName("Reconciliation report passes when order total equals payment amount")
    void testReconciliationBalanced() {
        Order order = Order.builder().orderNumber("QC100").totalAmount(BigDecimal.valueOf(450.00)).status(OrderStatus.CONFIRMED).build();
        Payment payment = Payment.builder().id(1L).transactionId("TXN100").amount(BigDecimal.valueOf(450.00)).paymentStatus(PaymentStatus.COMPLETED).order(order).build();

        when(paymentRepository.findAll()).thenReturn(List.of(payment));
        when(refundRepository.findAll()).thenReturn(List.of());

        ReconciliationReport report = reconciliationService.runReconciliation();

        assertNotNull(report);
        assertEquals("BALANCED", report.getStatus());
        assertEquals(1, report.getMatchedCount());
        assertEquals(0, report.getDiscrepancyCount());
        assertEquals(0, report.getDiscrepancies().size());
        assertEquals(BigDecimal.valueOf(450.00), report.getReconciledVolume());
    }

    @Test
    @DisplayName("Detects discrepancy when payment amount mismatches order total")
    void testReconciliationAmountMismatch() {
        Order order = Order.builder().orderNumber("QC200").totalAmount(BigDecimal.valueOf(500.00)).status(OrderStatus.CONFIRMED).build();
        Payment payment = Payment.builder().id(2L).transactionId("TXN200").amount(BigDecimal.valueOf(400.00)).paymentStatus(PaymentStatus.COMPLETED).order(order).build();

        when(paymentRepository.findAll()).thenReturn(List.of(payment));
        when(refundRepository.findAll()).thenReturn(List.of());

        ReconciliationReport report = reconciliationService.runReconciliation();

        assertNotNull(report);
        assertEquals("DISCREPANCIES_DETECTED", report.getStatus());
        assertEquals(0, report.getMatchedCount());
        assertEquals(1, report.getDiscrepancyCount());
        assertFalse(report.getDiscrepancies().isEmpty());
    }
}
