package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import com.quickcart.dto.NotificationDto;
import com.quickcart.security.UserDetailsImpl;
import com.quickcart.service.AuthService;
import com.quickcart.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/notifications", "/api/notifications"})
@RequiredArgsConstructor
@Tag(name = "Notification System", description = "APIs for customer in-app notifications and alerts")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all in-app notifications for authenticated user")
    public ResponseEntity<List<NotificationDto>> getUserNotifications() {
        UserDetailsImpl user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get count of unread notifications")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        UserDetailsImpl user = authService.getCurrentAuthenticatedUser();
        long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark a single notification as read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long id) {
        UserDetailsImpl user = authService.getCurrentAuthenticatedUser();
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Notification marked as read"));
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all user notifications as read")
    public ResponseEntity<ApiResponse> markAllAsRead() {
        UserDetailsImpl user = authService.getCurrentAuthenticatedUser();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(new ApiResponse(true, "All notifications marked as read"));
    }
}
