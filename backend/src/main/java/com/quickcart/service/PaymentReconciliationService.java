package com.quickcart.service;

import com.quickcart.dto.ReconciliationReport;
import com.quickcart.entity.Order;
import com.quickcart.entity.Payment;
import com.quickcart.entity.PaymentStatus;
import com.quickcart.entity.Refund;
import com.quickcart.repository.AuditLogRepository;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.PaymentRepository;
import com.quickcart.repository.RefundRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentReconciliationService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RefundRepository refundRepository;
    private final AuditLogRepository auditLogRepository;

    /**
     * Scheduled hourly reconciliation batch job comparing internal payment states with expected gateway state.
     */
    @Scheduled(cron = "${quickcart.jobs.reconciliationCron:0 0 * * * *}") // Hourly
    @Transactional
    public ReconciliationReport runReconciliation() {
        log.info("Starting automated payment reconciliation batch at {}", LocalDateTime.now());

        List<Payment> allPayments = paymentRepository.findAll();
        List<String> discrepancies = new ArrayList<>();
        int matchedCount = 0;
        int mismatchedCount = 0;
        BigDecimal reconciledVolume = BigDecimal.ZERO;

        for (Payment payment : allPayments) {
            Order order = payment.getOrder();
            if (order == null) {
                discrepancies.add("Payment id=" + payment.getId() + " [txn=" + payment.getTransactionId() + "] has no associated order record.");
                mismatchedCount++;
                continue;
            }

            // Verify payment amount matches order total amount
            if (payment.getAmount().compareTo(order.getTotalAmount()) != 0) {
                discrepancies.add("Amount mismatch on Order #" + order.getOrderNumber() + ": order total=₹" +
                        order.getTotalAmount() + ", payment recorded=₹" + payment.getAmount());
                mismatchedCount++;
                continue;
            }

            // Verify order status vs payment status consistency
            if (order.getStatus() == com.quickcart.entity.OrderStatus.DELIVERED && payment.getPaymentStatus() == PaymentStatus.FAILED) {
                discrepancies.add("CRITICAL: Order #" + order.getOrderNumber() + " is marked DELIVERED but payment is FAILED!");
                mismatchedCount++;
                continue;
            }

            matchedCount++;
            reconciledVolume = reconciledVolume.add(payment.getAmount());
        }

        // Verify refund records vs payments
        List<Refund> refunds = refundRepository.findAll();
        for (Refund refund : refunds) {
            if (refund.getAmount().compareTo(refund.getPayment().getAmount()) > 0) {
                discrepancies.add("Refund id=" + refund.getId() + " amount ₹" + refund.getAmount() +
                        " exceeds original payment amount ₹" + refund.getPayment().getAmount());
                mismatchedCount++;
            }
        }

        ReconciliationReport report = ReconciliationReport.builder()
                .executedAt(LocalDateTime.now())
                .totalTransactionsScanned(allPayments.size())
                .matchedCount(matchedCount)
                .discrepancyCount(mismatchedCount)
                .reconciledVolume(reconciledVolume)
                .discrepancies(discrepancies)
                .status(mismatchedCount == 0 ? "BALANCED" : "DISCREPANCIES_DETECTED")
                .build();

        log.info("Payment reconciliation finished: total={}, matched={}, discrepancies={}, status={}",
                report.getTotalTransactionsScanned(), report.getMatchedCount(), report.getDiscrepancyCount(), report.getStatus());

        return report;
    }
}
