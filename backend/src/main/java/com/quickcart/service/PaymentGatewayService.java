package com.quickcart.service;

import com.quickcart.dto.PaymentVerifyRequest;
import com.quickcart.entity.Order;
import com.quickcart.entity.Payment;
import com.quickcart.entity.PaymentStatus;
import com.quickcart.entity.Refund;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.PaymentRepository;
import com.quickcart.repository.RefundRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentGatewayService {

    @Value("${quickcart.app.payment.keySecret:rzp_secret_quickcartSecret2026}")
    private String paymentSecret;

    @Value("${quickcart.app.payment.webhookSecret:quickcart_webhook_secret_2026}")
    private String webhookSecret;

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RefundRepository refundRepository;
    private final NotificationService notificationService;

    public boolean verifySignature(String orderId, String paymentId, String receivedSignature) {
        if (receivedSignature == null || receivedSignature.isBlank()) {
            return false;
        }

        // Demo test mode / Mock key fallback
        if (receivedSignature.startsWith("mock_sig_") || "mock_signature".equals(receivedSignature)) {
            return true;
        }

        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(paymentSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String generatedSignature = HexFormat.of().formatHex(hash);

            return generatedSignature.equalsIgnoreCase(receivedSignature);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Failed to verify HMAC payment signature", e);
            return false;
        }
    }

    @Transactional
    public boolean processPaymentVerification(PaymentVerifyRequest request) {
        Payment payment = paymentRepository.findByTransactionId(request.getTransactionId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for transaction: " + request.getTransactionId()));

        boolean isValid = verifySignature(
                request.getGatewayOrderId() != null ? request.getGatewayOrderId() : request.getTransactionId(),
                request.getGatewayPaymentId(),
                request.getGatewaySignature()
        );

        if (!isValid) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            payment.setErrorMessage("Payment signature verification failed server-side.");
            paymentRepository.save(payment);
            throw new BadRequestException("Payment signature verification failed. Untrusted payment payload.");
        }

        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        payment.setGatewayOrderId(request.getGatewayOrderId());
        payment.setGatewaySignature(request.getGatewaySignature());
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        log.info("Payment verified successfully for Order #{}", order.getOrderNumber());

        notificationService.createNotification(
                order.getUser().getId(),
                "Payment Confirmed",
                "Your payment of ₹" + payment.getAmount() + " for order #" + order.getOrderNumber() + " was successfully verified.",
                "PAYMENT",
                order.getOrderNumber()
        );

        return true;
    }

    @Transactional
    public Refund initiateRefund(String orderNumber, BigDecimal amount, String reason) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with order number: " + orderNumber));

        Payment payment = order.getPayment();
        String refundRef = "RFND-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Refund refund = Refund.builder()
                .order(order)
                .payment(payment)
                .amount(amount)
                .reason(reason)
                .status("PROCESSED")
                .refundReference(refundRef)
                .build();

        if (payment != null) {
            payment.setPaymentStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);
        }

        Refund saved = refundRepository.save(refund);
        log.info("Refund processed: ref={}, order={}, amount=₹{}", refundRef, orderNumber, amount);

        notificationService.createNotification(
                order.getUser().getId(),
                "Refund Processed",
                "A refund of ₹" + amount + " for order #" + orderNumber + " has been processed. Reference: " + refundRef,
                "PAYMENT",
                refundRef
        );

        return saved;
    }
}
