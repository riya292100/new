package com.quickcart.service;

import com.quickcart.dto.NotificationDto;
import com.quickcart.entity.Notification;
import com.quickcart.entity.User;
import com.quickcart.repository.NotificationRepository;
import com.quickcart.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User testUser;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("alex@example.com")
                .fullName("Alex Mercer")
                .build();

        testNotification = Notification.builder()
                .id(10L)
                .user(testUser)
                .title("Order Confirmed")
                .message("Your order has been confirmed by the store.")
                .type("ORDER")
                .isRead(false)
                .build();
    }

    @Test
    @DisplayName("Should create and return notification")
    void shouldCreateNotification() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> {
            Notification n = i.getArgument(0);
            n.setId(10L);
            return n;
        });

        NotificationDto dto = notificationService.createNotification(1L, "Order Dispatched", "Delivery partner on the way", "DELIVERY", "QC12345");

        assertNotNull(dto);
        assertEquals("Order Dispatched", dto.getTitle());
        assertFalse(dto.getIsRead());
    }

    @Test
    @DisplayName("Should mark notification as read")
    void shouldMarkAsRead() {
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        notificationService.markAsRead(10L, 1L);

        assertTrue(testNotification.getIsRead());
    }

    @Test
    @DisplayName("Should return user notifications")
    void shouldReturnUserNotifications() {
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(testNotification));

        List<NotificationDto> list = notificationService.getUserNotifications(1L);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("Order Confirmed", list.get(0).getTitle());
    }
}
