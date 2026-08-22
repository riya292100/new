package com.quickcart.service;

import com.quickcart.dto.PaymentInitiateRequest;
import com.quickcart.dto.PaymentResponseDto;
import com.quickcart.dto.PaymentVerifyRequest;
import com.quickcart.entity.Order;
import com.quickcart.entity.Payment;
import com.quickcart.entity.PaymentStatus;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public PaymentResponseDto initiatePayment(PaymentInitiateRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(() -> {
                    Payment newPayment = new Payment();
                    newPayment.setOrder(order);
                    newPayment.setAmount(order.getTotalAmount());
                    newPayment.setCurrency("INR");
                    return newPayment;
                });

        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());

        Payment saved = paymentRepository.save(payment);
        return mapToDto(saved);
    }

    @Transactional
    public PaymentResponseDto verifyPayment(PaymentVerifyRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for order: " + request.getOrderId()));

        payment.setPaymentStatus(request.getStatus() != null ? request.getStatus() : PaymentStatus.COMPLETED);
        if (request.getTransactionId() != null && !request.getTransactionId().isBlank()) {
            payment.setTransactionId(request.getTransactionId());
        }

        Payment saved = paymentRepository.save(payment);
        return mapToDto(saved);
    }

    public PaymentResponseDto getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order id: " + orderId));
        return mapToDto(payment);
    }

    private PaymentResponseDto mapToDto(Payment payment) {
        return new PaymentResponseDto(
                payment.getId(),
                payment.getOrder().getId(),
                payment.getOrder().getOrderNumber(),
                payment.getTransactionId(),
                payment.getPaymentMethod(),
                payment.getPaymentStatus(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getCreatedAt()
        );
    }
}
