package com.quickcart.service.order;

import com.quickcart.dto.OrderResponse;
import com.quickcart.entity.*;
import com.quickcart.event.DomainEventPublisher;
import com.quickcart.event.OrderEvents;
import com.quickcart.logging.StructuredAuditLogger;
import com.quickcart.repository.OrderStateHistoryRepository;
import com.quickcart.repository.ProductRepository;
import com.quickcart.service.InventoryService;
import com.quickcart.service.NotificationService;
import com.quickcart.service.OrderTrackingWebSocketService;
import com.quickcart.service.PaymentGatewayService;
import com.quickcart.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Handles complex side-effects for Order lifecycle state transitions.
 * Coordinates stock reservation commits/releases, wallet cashback/refunds, gateway refunds, and notifications.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderLifecycleHandler {

    private final InventoryService inventoryService;
    private final WalletService walletService;
    private final PaymentGatewayService paymentGatewayService;
    private final NotificationService notificationService;
    private final ProductRepository productRepository;
    private final DomainEventPublisher domainEventPublisher;
    private final OrderTrackingWebSocketService webSocketService;
    private final OrderStateHistoryRepository orderStateHistoryRepository;
    private final StructuredAuditLogger auditLogger;

    public void handleDelivered(Order order) {
        order.setDeliveredAt(LocalDateTime.now());
        if (order.getPayment() != null) {
            order.getPayment().setPaymentStatus(PaymentStatus.COMPLETED);
        }
        if (order.getDeliveryAssignment() != null) {
            order.getDeliveryAssignment().setStatus("DELIVERED");
            order.getDeliveryAssignment().setDeliveredAt(LocalDateTime.now());
        }

        Long storeId = order.getStore() != null ? order.getStore().getId() : null;

        // Commit inventory stock deduction
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    inventoryService.commitDeductionForOrder(storeId, item.getProduct().getId(), item.getQuantity(), order.getOrderNumber());
                }
            }
        }

        // Credit loyalty cashback to user wallet
        walletService.creditCashbackForOrder(order.getUser(), order);

        // Publish domain event
        domainEventPublisher.publish(OrderEvents.OrderDeliveredEvent.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getUser().getId())
                .partnerId(order.getDeliveryAssignment() != null && order.getDeliveryAssignment().getPartner() != null ? order.getDeliveryAssignment().getPartner().getId() : null)
                .build());

        // Dispatch customer notification
        notificationService.createNotification(
                order.getUser().getId(),
                "Order Delivered!",
                "Order #" + order.getOrderNumber() + " was delivered. Enjoy your groceries!",
                "ORDER",
                order.getOrderNumber()
        );

        auditLogger.logEvent("ORDER_LIFECYCLE", "ORDER_DELIVERED", "SUCCESS", Map.of(
                "orderNumber", order.getOrderNumber(),
                "customerId", order.getUser().getId()
        ));
    }

    public void handleCancelled(Order order) {
        Long storeId = order.getStore() != null ? order.getStore().getId() : null;

        // Restore reserved stock
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    inventoryService.releaseReservedStock(storeId, item.getProduct().getId(), item.getQuantity(), order.getOrderNumber());
                    Product p = item.getProduct();
                    p.setStockQuantity(p.getStockQuantity() + item.getQuantity());
                    productRepository.save(p);
                }
            }
        }

        // Refund wallet deductions
        if (order.getWalletDiscountAmount() != null && order.getWalletDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            walletService.refundForOrder(order.getUser(), order.getWalletDiscountAmount(), order.getOrderNumber());
        }

        // Refund payment gateway charges
        if (order.getPayment() != null && order.getPayment().getPaymentStatus() == PaymentStatus.COMPLETED) {
            paymentGatewayService.initiateRefund(order.getOrderNumber(), order.getTotalAmount(), "Order cancelled");
        }

        if (order.getDeliveryAssignment() != null) {
            order.getDeliveryAssignment().setStatus("CANCELLED");
        }

        notificationService.createNotification(
                order.getUser().getId(),
                "Order Cancelled",
                "Order #" + order.getOrderNumber() + " has been cancelled.",
                "ORDER",
                order.getOrderNumber()
        );

        auditLogger.logEvent("ORDER_LIFECYCLE", "ORDER_CANCELLED", "SUCCESS", Map.of(
                "orderNumber", order.getOrderNumber(),
                "customerId", order.getUser().getId()
        ));
    }

    public void recordTransition(Order order, OrderStatus oldStatus, OrderStatus newStatus, String actor, OrderResponse response) {
        orderStateHistoryRepository.save(OrderStateHistory.builder()
                .order(order)
                .fromStatus(oldStatus)
                .toStatus(newStatus)
                .actor(actor != null ? actor : "SYSTEM")
                .reason("Transitioned from " + oldStatus + " to " + newStatus)
                .build());

        webSocketService.broadcastOrderStatusUpdate(response);
    }
}
