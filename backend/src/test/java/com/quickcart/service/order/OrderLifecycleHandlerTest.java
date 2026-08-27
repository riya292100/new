package com.quickcart.service.order;

import com.quickcart.entity.*;
import com.quickcart.event.DomainEventPublisher;
import com.quickcart.logging.StructuredAuditLogger;
import com.quickcart.repository.OrderStateHistoryRepository;
import com.quickcart.repository.ProductRepository;
import com.quickcart.service.InventoryService;
import com.quickcart.service.NotificationService;
import com.quickcart.service.OrderTrackingWebSocketService;
import com.quickcart.service.PaymentGatewayService;
import com.quickcart.service.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderLifecycleHandlerTest {

    @Mock
    private InventoryService inventoryService;

    @Mock
    private WalletService walletService;

    @Mock
    private PaymentGatewayService paymentGatewayService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private DomainEventPublisher domainEventPublisher;

    @Mock
    private OrderTrackingWebSocketService webSocketService;

    @Mock
    private OrderStateHistoryRepository orderStateHistoryRepository;

    @Mock
    private StructuredAuditLogger auditLogger;

    @InjectMocks
    private OrderLifecycleHandler lifecycleHandler;

    private Order testOrder;
    private User testUser;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).email("alex@example.com").build();
        testProduct = Product.builder().id(10L).name("Apples").stockQuantity(50).build();
        OrderItem item = new OrderItem(null, testProduct, "Apples", "", "1 kg", 2, BigDecimal.valueOf(100), BigDecimal.valueOf(200));

        Payment payment = Payment.builder()
                .paymentStatus(PaymentStatus.COMPLETED)
                .amount(BigDecimal.valueOf(200))
                .build();

        testOrder = Order.builder()
                .id(100L)
                .orderNumber("QC100200")
                .user(testUser)
                .items(List.of(item))
                .payment(payment)
                .walletDiscountAmount(BigDecimal.valueOf(50))
                .totalAmount(BigDecimal.valueOf(150))
                .build();
    }

    @Test
    @DisplayName("Should commit inventory and grant loyalty cashback on DELIVERED transition")
    void shouldHandleDeliveredTransition() {
        lifecycleHandler.handleDelivered(testOrder);

        assertNotNull(testOrder.getDeliveredAt());
        assertEquals(PaymentStatus.COMPLETED, testOrder.getPayment().getPaymentStatus());
        verify(inventoryService, times(1)).commitDeductionForOrder(isNull(), eq(10L), eq(2), eq("QC100200"));
        verify(walletService, times(1)).creditCashbackForOrder(eq(testUser), eq(testOrder));
        verify(domainEventPublisher, times(1)).publish(any());
        verify(notificationService, times(1)).createNotification(eq(1L), anyString(), anyString(), eq("ORDER"), eq("QC100200"));
    }

    @Test
    @DisplayName("Should release inventory, refund wallet, and initiate payment gateway refund on CANCELLED")
    void shouldHandleCancelledTransition() {
        lifecycleHandler.handleCancelled(testOrder);

        verify(inventoryService, times(1)).releaseReservedStock(isNull(), eq(10L), eq(2), eq("QC100200"));
        verify(productRepository, times(1)).save(any(Product.class));
        verify(walletService, times(1)).refundForOrder(eq(testUser), eq(BigDecimal.valueOf(50)), eq("QC100200"));
        verify(paymentGatewayService, times(1)).initiateRefund(eq("QC100200"), eq(BigDecimal.valueOf(150)), anyString());
        verify(notificationService, times(1)).createNotification(eq(1L), eq("Order Cancelled"), anyString(), eq("ORDER"), eq("QC100200"));
    }
}
