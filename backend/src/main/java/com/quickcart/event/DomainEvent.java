package com.quickcart.event;

import java.io.Serializable;
import java.time.Instant;

public interface DomainEvent extends Serializable {
    String getEventId();
    String getEventType();
    Instant getTimestamp();
}
