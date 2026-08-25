package com.quickcart.service;

import com.quickcart.dto.AddTicketMessageDto;
import com.quickcart.dto.CreateSupportTicketDto;
import com.quickcart.dto.SupportTicketDto;
import com.quickcart.entity.SupportTicket;
import com.quickcart.entity.TicketMessage;
import com.quickcart.entity.User;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.SupportTicketRepository;
import com.quickcart.repository.TicketMessageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupportTicketServiceTest {

    @Mock
    private SupportTicketRepository supportTicketRepository;

    @Mock
    private TicketMessageRepository ticketMessageRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private AuthService authService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private SupportTicketService supportTicketService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("alex@example.com").fullName("Alex Mercer").build();
    }

    @Test
    @DisplayName("Should create support ticket with calculated SLA due date")
    void testCreateTicket_Success() {
        when(authService.getCurrentUserEntity()).thenReturn(user);
        when(supportTicketRepository.save(any(SupportTicket.class))).thenAnswer(inv -> {
            SupportTicket t = inv.getArgument(0);
            t.setId(10L);
            return t;
        });

        CreateSupportTicketDto req = new CreateSupportTicketDto(
                null,
                SupportTicket.TicketCategory.ORDER_ISSUE,
                SupportTicket.TicketPriority.URGENT,
                "Missing items from grocery bag",
                "Two milk bottles were not present in the delivery bag."
        );

        SupportTicketDto ticket = supportTicketService.createTicket(req);

        assertNotNull(ticket);
        assertTrue(ticket.getTicketNumber().startsWith("TICK-"));
        assertEquals(SupportTicket.TicketPriority.URGENT, ticket.getPriority());
        assertEquals(SupportTicket.TicketStatus.OPEN, ticket.getStatus());
        assertNotNull(ticket.getSlaDueAt());
        assertTrue(ticket.getSlaDueAt().isAfter(LocalDateTime.now()));

        verify(supportTicketRepository, times(1)).save(any(SupportTicket.class));
        verify(ticketMessageRepository, times(1)).save(any(TicketMessage.class));
    }

    @Test
    @DisplayName("Should add reply message to existing support ticket")
    void testAddMessage() {
        SupportTicket ticket = SupportTicket.builder()
                .id(10L)
                .ticketNumber("TICK-12345")
                .user(user)
                .status(SupportTicket.TicketStatus.OPEN)
                .category(SupportTicket.TicketCategory.PAYMENT_FAILURE)
                .priority(SupportTicket.TicketPriority.HIGH)
                .subject("Payment debited but order failed")
                .description("Card was charged 200 INR")
                .build();

        when(authService.getCurrentUserEntity()).thenReturn(user);
        when(supportTicketRepository.findById(10L)).thenReturn(Optional.of(ticket));
        when(ticketMessageRepository.save(any(TicketMessage.class))).thenAnswer(inv -> inv.getArgument(0));

        AddTicketMessageDto req = new AddTicketMessageDto("Here is the transaction screenshot reference", false);
        SupportTicketDto result = supportTicketService.addMessage(10L, req);

        assertNotNull(result);
        verify(ticketMessageRepository, times(1)).save(any(TicketMessage.class));
    }
}
