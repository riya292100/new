package com.quickcart.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "support_tickets", indexes = {
        @Index(name = "idx_ticket_number", columnList = "ticketNumber"),
        @Index(name = "idx_ticket_user_id", columnList = "user_id"),
        @Index(name = "idx_ticket_status", columnList = "status"),
        @Index(name = "idx_ticket_priority", columnList = "priority")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String ticketNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "roles", "passwordHash"})
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "items"})
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TicketCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TicketStatus status;

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(length = 100)
    private String assignedAgentEmail;

    private LocalDateTime slaDueAt;

    @Builder.Default
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<TicketMessage> messages = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum TicketCategory {
        ORDER_ISSUE,
        PAYMENT_FAILURE,
        DELIVERY_DELAY,
        QUALITY_ISSUE,
        ACCOUNT_INQUIRY,
        OTHER
    }

    public enum TicketPriority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT
    }

    public enum TicketStatus {
        OPEN,
        IN_PROGRESS,
        WAITING_FOR_CUSTOMER,
        RESOLVED,
        CLOSED
    }
}
