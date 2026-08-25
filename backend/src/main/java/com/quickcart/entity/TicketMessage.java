package com.quickcart.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_messages", indexes = {
        @Index(name = "idx_ticket_msg_ticket_id", columnList = "ticket_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "messages"})
    private SupportTicket ticket;

    @Column(nullable = false, length = 100)
    private String senderName;

    @Column(nullable = false, length = 50)
    private String senderRole; // "CUSTOMER", "SUPPORT_AGENT", "SYSTEM"

    @Column(nullable = false, length = 2000)
    private String message;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isInternalNote = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
