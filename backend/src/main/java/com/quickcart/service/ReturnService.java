package com.quickcart.service;

import com.quickcart.dto.CreateReturnRequestDto;
import com.quickcart.dto.ReturnRequestDto;
import com.quickcart.entity.*;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.ReturnRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReturnService {

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final AuthService authService;
    private final WalletService walletService;
    private final PaymentGatewayService paymentGatewayService;
    private final FinancialLedgerService financialLedgerService;
    private final NotificationService notificationService;

    @Transactional
    public ReturnRequestDto createReturnRequest(CreateReturnRequestDto request) {
        User currentUser = authService.getCurrentUserEntity();
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Unauthorized access to create return for this order");
        }

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("Returns can only be requested for DELIVERED orders");
        }

        // Return window validation: 7 days from delivery
        LocalDateTime deliveryTime = order.getDeliveredAt() != null ? order.getDeliveredAt() : order.getUpdatedAt();
        if (deliveryTime != null && deliveryTime.isBefore(LocalDateTime.now().minusDays(7))) {
            throw new BadRequestException("Return window of 7 days has expired for this order");
        }

        BigDecimal refundAmt = request.getRequestedRefundAmount() != null && request.getRequestedRefundAmount().compareTo(BigDecimal.ZERO) > 0
                ? request.getRequestedRefundAmount().min(order.getTotalAmount())
                : order.getTotalAmount();

        String returnNumber = "RET-" + System.currentTimeMillis() % 100000000;

        ReturnRequest returnRequest = ReturnRequest.builder()
                .returnNumber(returnNumber)
                .order(order)
                .user(currentUser)
                .reason(request.getReason())
                .status(ReturnRequest.ReturnStatus.REQUESTED)
                .refundAmount(refundAmt)
                .build();

        ReturnRequest saved = returnRequestRepository.save(returnRequest);
        log.info("Created return request {} for order #{} by user {}", returnNumber, order.getOrderNumber(), currentUser.getEmail());

        notificationService.createNotification(
                currentUser.getId(),
                "Return Request Received",
                "Your return request #" + returnNumber + " has been registered and is under review.",
                "RETURN",
                order.getOrderNumber()
        );

        return mapToDto(saved);
    }

    public List<ReturnRequestDto> getUserReturns() {
        User currentUser = authService.getCurrentUserEntity();
        return returnRequestRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public Page<ReturnRequestDto> getAllReturnsAdmin(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return returnRequestRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToDto);
    }

    @Transactional
    public ReturnRequestDto updateReturnStatus(Long returnId, ReturnRequest.ReturnStatus newStatus, String adminNotes, LocalDateTime pickupTime) {
        ReturnRequest ret = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found with id: " + returnId));

        ret.setStatus(newStatus);
        if (adminNotes != null) ret.setAdminNotes(adminNotes);
        if (pickupTime != null) ret.setPickupScheduledAt(pickupTime);

        // If approved and refunded, disburse refund and log financial movement
        if (newStatus == ReturnRequest.ReturnStatus.REFUNDED) {
            disburseRefundForReturn(ret);
        }

        ReturnRequest saved = returnRequestRepository.save(ret);

        notificationService.createNotification(
                ret.getUser().getId(),
                "Return Status Update: " + newStatus,
                "Return request #" + ret.getReturnNumber() + " is now " + newStatus,
                "RETURN",
                ret.getOrder().getOrderNumber()
        );

        return mapToDto(saved);
    }

    private void disburseRefundForReturn(ReturnRequest ret) {
        Order order = ret.getOrder();
        BigDecimal refundAmount = ret.getRefundAmount();

        // 1. If paid via wallet, refund wallet
        if (order.getWalletDiscountAmount() != null && order.getWalletDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal walletRefund = refundAmount.min(order.getWalletDiscountAmount());
            walletService.refundForOrder(ret.getUser(), walletRefund, order.getOrderNumber());
            financialLedgerService.recordMovement(
                    order.getOrderNumber(),
                    FinancialLedgerEntry.LedgerEntryType.WALLET_CREDIT,
                    walletRefund,
                    FinancialLedgerEntry.LedgerDirection.CREDIT,
                    "ADMIN_RETURN_REFUND",
                    "Wallet refund for return " + ret.getReturnNumber()
            );
        }

        // 2. Gateway refund if online payment
        if (order.getPayment() != null && order.getPayment().getPaymentStatus() == PaymentStatus.COMPLETED) {
            paymentGatewayService.initiateRefund(order.getOrderNumber(), refundAmount, "Return approved: " + ret.getReturnNumber());
            financialLedgerService.recordMovement(
                    order.getOrderNumber(),
                    FinancialLedgerEntry.LedgerEntryType.REFUND,
                    refundAmount,
                    FinancialLedgerEntry.LedgerDirection.CREDIT,
                    "PAYMENT_GATEWAY_REFUND",
                    "Gateway refund for return " + ret.getReturnNumber()
            );
        }
    }

    private ReturnRequestDto mapToDto(ReturnRequest r) {
        return ReturnRequestDto.builder()
                .id(r.getId())
                .returnNumber(r.getReturnNumber())
                .orderId(r.getOrder().getId())
                .orderNumber(r.getOrder().getOrderNumber())
                .userId(r.getUser().getId())
                .userEmail(r.getUser().getEmail())
                .reason(r.getReason())
                .status(r.getStatus())
                .refundAmount(r.getRefundAmount())
                .adminNotes(r.getAdminNotes())
                .pickupScheduledAt(r.getPickupScheduledAt())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
