package com.quickcart.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "quickcart.events.kafkaEnabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class KafkaEventPublisher implements DomainEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String TOPIC = "quickcart.events";

    @Override
    public void publish(DomainEvent event) {
        try {
            log.info("Publishing event to Kafka topic [{}]: type={}, id={}", TOPIC, event.getEventType(), event.getEventId());
            kafkaTemplate.send(TOPIC, event.getEventType(), event);
        } catch (Exception ex) {
            log.error("Failed to publish event to Kafka [{}]: {}", event.getEventType(), ex.getMessage(), ex);
        }
    }
}
