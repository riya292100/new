package com.quickcart.controller;

import com.quickcart.dto.*;
import com.quickcart.service.PaymentGatewayService;
import com.quickcart.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/payments", "/api/payments"})
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Endpoints for payment initiation, server-side HMAC signature verification, and refunds")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentGatewayService paymentGatewayService;

    @PostMapping("/initiate")
    @Operation(summary = "Initiate a payment transaction order")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> initiatePayment(
            @Valid @RequestBody PaymentInitiateRequest request
    ) {
        PaymentResponseDto response = paymentService.initiatePayment(request);
        return ResponseEntity.ok(ApiResponse.success("Payment initiated", response));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify a payment transaction callback with HMAC-SHA256 signature verification")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request
    ) {
        PaymentResponseDto response = paymentService.verifyPayment(request);
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", response));
    }

    @PostMapping("/refund")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Process refund for an order (Admin)")
    public ResponseEntity<ApiResponse<Void>> processRefund(@Valid @RequestBody RefundRequest request) {
        paymentGatewayService.initiateRefund(request.getOrderNumber(), request.getAmount(), request.getReason());
        return ResponseEntity.ok(ApiResponse.success("Refund processed successfully", null));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get payment transaction details for an order")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> getPaymentByOrderId(@PathVariable Long orderId) {
        PaymentResponseDto response = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
