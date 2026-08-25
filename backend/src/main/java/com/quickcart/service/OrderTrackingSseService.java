package com.quickcart.service;

import com.quickcart.dto.OrderResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class OrderTrackingSseService {

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribeToOrderUpdates(Long orderId) {
        SseEmitter emitter = new SseEmitter(180_000L); // 3-minute timeout
        emitters.put(orderId, emitter);

        emitter.onCompletion(() -> emitters.remove(orderId));
        emitter.onTimeout(() -> {
            emitter.complete();
            emitters.remove(orderId);
        });
        emitter.onError((e) -> emitters.remove(orderId));

        try {
            emitter.send(SseEmitter.event().name("CONNECT").data("Connected to live tracking stream for order #" + orderId));
        } catch (IOException ignored) {}

        return emitter;
    }

    public void emitOrderUpdate(OrderResponse order) {
        if (order == null || order.getId() == null) return;
        SseEmitter emitter = emitters.get(order.getId());
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name("ORDER_UPDATE").data(order));
            } catch (IOException e) {
                emitters.remove(order.getId());
            }
        }
    }
}
