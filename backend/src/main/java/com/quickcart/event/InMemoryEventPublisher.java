package com.quickcart.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "quickcart.events.kafkaEnabled", havingValue = "false", matchIfMissing = true)
@Primary
@RequiredArgsConstructor
@Slf4j
public class InMemoryEventPublisher implements DomainEventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void publish(DomainEvent event) {
        log.debug("Publishing domain event to Spring ApplicationEventPublisher: type={}, id={}", event.getEventType(), event.getEventId());
        applicationEventPublisher.publishEvent(event);
    }
}
