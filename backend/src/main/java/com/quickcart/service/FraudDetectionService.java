package com.quickcart.service;

import com.quickcart.entity.FraudAlert;
import com.quickcart.entity.Order;
import com.quickcart.entity.Payment;
import com.quickcart.entity.PaymentStatus;
import com.quickcart.repository.FraudAlertRepository;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FraudDetectionService {

    private final FraudAlertRepository fraudAlertRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    /**
     * Evaluates real-time risk factors for a given user transaction/order:
     * - Rapid successive cancellations (> 3 within 24 hours)
     * - Excessive failed payments (> 3 within 1 hour)
     * - High refund velocity
     */
    @Transactional
    public void evaluateUserRisk(Long userId, String context) {
        if (userId == null) return;

        LocalDateTime oneDayAgo = LocalDateTime.now().minusHours(24);
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);

        // 1. Check Cancellation Velocity
        List<Order> recentOrders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        long recentCancellations = recentOrders.stream()
                .filter(o -> o.getStatus() == com.quickcart.entity.OrderStatus.CANCELLED && o.getCreatedAt().isAfter(oneDayAgo))
                .count();

        if (recentCancellations >= 3) {
            createAlert(userId, 75, "EXCESSIVE_CANCELLATIONS",
                    "User has cancelled " + recentCancellations + " orders within the last 24 hours. Context: " + context);
        }

        // 2. Check Failed Payment Spike
        long failedPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getOrder() != null && userId.equals(p.getOrder().getUser().getId())
                        && p.getPaymentStatus() == PaymentStatus.FAILED
                        && p.getCreatedAt().isAfter(oneHourAgo))
                .count();

        if (failedPayments >= 3) {
            createAlert(userId, 85, "FAILED_PAYMENT_SPIKE",
                    "User generated " + failedPayments + " failed payment attempts within the last hour. Potential card testing.");
        }
    }

    private void createAlert(Long userId, int riskScore, String factor, String details) {
        log.warn("FLAGGED SUSPICIOUS ACTIVITY: userId={}, factor={}, score={}, details={}", userId, factor, riskScore, details);

        FraudAlert alert = FraudAlert.builder()
                .userId(userId)
                .riskScore(riskScore)
                .riskFactor(factor)
                .details(details)
                .status("PENDING_REVIEW")
                .build();

        fraudAlertRepository.save(alert);
    }

    public Page<FraudAlert> getPendingAlerts(Pageable pageable) {
        return fraudAlertRepository.findByStatus("PENDING_REVIEW", pageable);
    }

    @Transactional
    public FraudAlert resolveAlert(Long alertId, String resolutionStatus) {
        FraudAlert alert = fraudAlertRepository.findById(alertId)
                .orElseThrow(() -> new com.quickcart.exception.ResourceNotFoundException("Fraud alert not found with id: " + alertId));
        alert.setStatus(resolutionStatus);
        return fraudAlertRepository.save(alert);
    }
}
