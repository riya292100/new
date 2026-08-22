package com.quickcart.service;

import com.quickcart.dto.OrderResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderTrackingWebSocketService {

    private static final Logger logger = LoggerFactory.getLogger(OrderTrackingWebSocketService.class);
    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastOrderStatusUpdate(OrderResponse order) {
        String destination = "/topic/orders/" + order.getId();
        logger.info("Broadcasting order status update to {}: {}", destination, order.getStatus());
        messagingTemplate.convertAndSend(destination, order);

        // Also broadcast to user-specific channel
        messagingTemplate.convertAndSend("/topic/user/" + order.getUserId() + "/orders", order);

        // Also broadcast to delivery partner and admin live queues
        messagingTemplate.convertAndSend("/topic/admin/orders", order);
    }

    public void broadcastDeliveryLocation(Long orderId, BigDecimal lat, BigDecimal lng, String status) {
        String destination = "/topic/orders/" + orderId + "/location";
        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId", orderId);
        payload.put("latitude", lat);
        payload.put("longitude", lng);
        payload.put("status", status);
        payload.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend(destination, payload);
    }
}
