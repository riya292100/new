package com.quickcart.service;

import com.quickcart.dto.CreateReturnRequestDto;
import com.quickcart.dto.ReturnRequestDto;
import com.quickcart.entity.Order;
import com.quickcart.entity.OrderStatus;
import com.quickcart.entity.ReturnRequest;
import com.quickcart.entity.User;
import com.quickcart.exception.BadRequestException;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.ReturnRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReturnServiceTest {

    @Mock
    private ReturnRequestRepository returnRequestRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private AuthService authService;

    @Mock
    private WalletService walletService;

    @Mock
    private PaymentGatewayService paymentGatewayService;

    @Mock
    private FinancialLedgerService financialLedgerService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ReturnService returnService;

    private User user;
    private Order deliveredOrder;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("sarah@example.com").fullName("Sarah Connor").build();

        deliveredOrder = Order.builder()
                .id(101L)
                .orderNumber("QC1001")
                .user(user)
                .status(OrderStatus.DELIVERED)
                .totalAmount(BigDecimal.valueOf(500.00))
                .deliveredAt(LocalDateTime.now().minusDays(2))
                .build();
    }

    @Test
    @DisplayName("Should successfully create return request for delivered order")
    void testCreateReturnRequest_Success() {
        when(authService.getCurrentUserEntity()).thenReturn(user);
        when(orderRepository.findById(101L)).thenReturn(Optional.of(deliveredOrder));
        when(returnRequestRepository.save(any(ReturnRequest.class))).thenAnswer(inv -> {
            ReturnRequest r = inv.getArgument(0);
            r.setId(1L);
            return r;
        });

        CreateReturnRequestDto req = new CreateReturnRequestDto(101L, "Damaged items in delivery packet", BigDecimal.valueOf(500.00));
        ReturnRequestDto result = returnService.createReturnRequest(req);

        assertNotNull(result);
        assertTrue(result.getReturnNumber().startsWith("RET-"));
        assertEquals(ReturnRequest.ReturnStatus.REQUESTED, result.getStatus());
        assertEquals("Damaged items in delivery packet", result.getReason());
        verify(returnRequestRepository, times(1)).save(any(ReturnRequest.class));
    }

    @Test
    @DisplayName("Should reject return request if order is not delivered")
    void testCreateReturnRequest_NotDelivered() {
        deliveredOrder.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        when(authService.getCurrentUserEntity()).thenReturn(user);
        when(orderRepository.findById(101L)).thenReturn(Optional.of(deliveredOrder));

        CreateReturnRequestDto req = new CreateReturnRequestDto(101L, "Wrong item", BigDecimal.valueOf(500.00));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> returnService.createReturnRequest(req));
        assertTrue(ex.getMessage().contains("DELIVERED"));
    }

    @Test
    @DisplayName("Should reject return request if 7-day return window has expired")
    void testCreateReturnRequest_ExpiredWindow() {
        deliveredOrder.setDeliveredAt(LocalDateTime.now().minusDays(10));
        when(authService.getCurrentUserEntity()).thenReturn(user);
        when(orderRepository.findById(101L)).thenReturn(Optional.of(deliveredOrder));

        CreateReturnRequestDto req = new CreateReturnRequestDto(101L, "Item expired", BigDecimal.valueOf(500.00));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> returnService.createReturnRequest(req));
        assertTrue(ex.getMessage().contains("expired"));
    }
}
