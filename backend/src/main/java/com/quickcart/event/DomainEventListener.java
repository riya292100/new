package com.quickcart.event;

import com.quickcart.entity.AuditLog;
import com.quickcart.entity.Notification;
import com.quickcart.entity.User;
import com.quickcart.repository.AuditLogRepository;
import com.quickcart.repository.NotificationRepository;
import com.quickcart.repository.UserRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DomainEventListener {

    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final MeterRegistry meterRegistry;

    @Async
    @EventListener
    public void handleOrderCreated(OrderEvents.OrderCreatedEvent event) {
        log.info("Handling OrderCreatedEvent for order: {}", event.getOrderNumber());
        Counter.builder("quickcart.orders.created")
                .description("Count of created orders")
                .register(meterRegistry)
                .increment();

        if (event.getCustomerId() != null) {
            userRepository.findById(event.getCustomerId()).ifPresent(user -> {
                Notification notification = Notification.builder()
                        .user(user)
                        .title("Order Placed Successfully")
                        .message("Your order #" + event.getOrderNumber() + " for ₹" + event.getTotalAmount() + " has been placed!")
                        .type("ORDER")
                        .referenceId(event.getOrderNumber())
                        .isRead(false)
                        .build();
                notificationRepository.save(notification);
            });
        }

        auditLogRepository.save(AuditLog.builder()
                .action("ORDER_CREATED")
                .entityName("Order")
                .entityId(String.valueOf(event.getOrderId()))
                .performedBy(event.getCustomerEmail() != null ? event.getCustomerEmail() : "System")
                .details("Order #" + event.getOrderNumber() + " with " + event.getItemCount() + " items created")
                .build());
    }

    @Async
    @EventListener
    public void handleOrderDelivered(OrderEvents.OrderDeliveredEvent event) {
        log.info("Handling OrderDeliveredEvent for order: {}", event.getOrderNumber());
        Counter.builder("quickcart.orders.completed")
                .description("Count of successfully delivered orders")
                .register(meterRegistry)
                .increment();

        if (event.getCustomerId() != null) {
            userRepository.findById(event.getCustomerId()).ifPresent(user -> {
                Notification notification = Notification.builder()
                        .user(user)
                        .title("Order Delivered! 🚀")
                        .message("Your order #" + event.getOrderNumber() + " has arrived. Enjoy your items!")
                        .type("DELIVERY")
                        .referenceId(event.getOrderNumber())
                        .isRead(false)
                        .build();
                notificationRepository.save(notification);
            });
        }
    }

    @Async
    @EventListener
    public void handlePaymentFailed(PaymentEvents.PaymentFailedEvent event) {
        log.warn("Handling PaymentFailedEvent for order: {}, reason: {}", event.getOrderId(), event.getFailureReason());
        Counter.builder("quickcart.payments.failed")
                .description("Count of failed payment attempts")
                .register(meterRegistry)
                .increment();
    }

    @Async
    @EventListener
    public void handleLowStock(InventoryEvents.LowStockDetectedEvent event) {
        log.warn("Low stock alert for product '{}' (id: {}) at store {}: current={}, threshold={}",
                event.getProductName(), event.getProductId(), event.getStoreId(), event.getCurrentStock(), event.getReorderThreshold());
        Counter.builder("quickcart.inventory.low_stock")
                .description("Low stock alert occurrences")
                .register(meterRegistry)
                .increment();
    }
}
