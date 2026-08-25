package com.quickcart.event;

public interface DomainEventPublisher {
    void publish(DomainEvent event);
}
