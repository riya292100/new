package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import com.quickcart.dto.PaymentInitiateRequest;
import com.quickcart.dto.PaymentResponseDto;
import com.quickcart.dto.PaymentVerifyRequest;
import com.quickcart.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Endpoints for payment initiation and verification")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    @Operation(summary = "Initiate a mock/sandbox payment transaction")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> initiatePayment(
            @Valid @RequestBody PaymentInitiateRequest request
    ) {
        PaymentResponseDto response = paymentService.initiatePayment(request);
        return ResponseEntity.ok(ApiResponse.success("Payment initiated", response));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify a payment transaction callback")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request
    ) {
        PaymentResponseDto response = paymentService.verifyPayment(request);
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", response));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get payment transaction details for an order")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> getPaymentByOrderId(@PathVariable Long orderId) {
        PaymentResponseDto response = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
