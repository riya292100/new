package com.quickcart.controller;

import com.quickcart.dto.*;
import com.quickcart.entity.User;
import com.quickcart.entity.WalletTransactionType;
import com.quickcart.service.AuthService;
import com.quickcart.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final AuthService authService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<WalletResponse>> getMyWallet() {
        User currentUser = authService.getCurrentUserEntity();
        WalletResponse wallet = walletService.getWallet(currentUser);
        return ResponseEntity.ok(ApiResponse.success(wallet));
    }

    @GetMapping("/transactions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<WalletTransactionDto>>> getMyTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        User currentUser = authService.getCurrentUserEntity();
        Pageable pageable = PageRequest.of(page, size);
        Page<WalletTransactionDto> transactions = walletService.getTransactions(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    @PostMapping("/redeem-preview")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> previewRedemption(
            @Valid @RequestBody WalletRedeemRequest request
    ) {
        User currentUser = authService.getCurrentUserEntity();
        WalletResponse wallet = walletService.getWallet(currentUser);

        BigDecimal availableBalance = wallet.getBalance() != null ? wallet.getBalance() : BigDecimal.ZERO;
        BigDecimal orderAmount = request.getOrderAmount() != null ? request.getOrderAmount() : BigDecimal.ZERO;
        BigDecimal requested = request.getAmountToRedeem() != null ? request.getAmountToRedeem() : availableBalance;

        // Max usable discount is minimum of available balance and order amount
        BigDecimal maxUsable = availableBalance.min(orderAmount);
        BigDecimal actualApplied = requested.min(maxUsable);
        BigDecimal newPayable = orderAmount.subtract(actualApplied).max(BigDecimal.ZERO);

        Map<String, Object> result = new HashMap<>();
        result.put("availableBalance", availableBalance);
        result.put("appliedDiscount", actualApplied);
        result.put("remainingBalance", availableBalance.subtract(actualApplied));
        result.put("originalOrderAmount", orderAmount);
        result.put("finalPayableAmount", newPayable);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/add-demo-funds")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<WalletResponse>> addDemoFunds(
            @Valid @RequestBody WalletAddFundsRequest request
    ) {
        User currentUser = authService.getCurrentUserEntity();
        WalletResponse updatedWallet = walletService.addFunds(
                currentUser,
                request.getAmount(),
                request.getDescription() != null ? request.getDescription() : "QuickCash Instant Demo Reward",
                WalletTransactionType.CREDIT_PROMO
        );
        return ResponseEntity.ok(ApiResponse.success("QuickCash demo credits added successfully", updatedWallet));
    }
}
