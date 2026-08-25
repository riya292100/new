package com.quickcart.dto;

import com.quickcart.entity.SupportTicket;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketDto {
    private Long id;
    private String ticketNumber;
    private Long userId;
    private String userEmail;
    private String userName;
    private Long orderId;
    private String orderNumber;
    private SupportTicket.TicketCategory category;
    private SupportTicket.TicketPriority priority;
    private SupportTicket.TicketStatus status;
    private String subject;
    private String description;
    private String assignedAgentEmail;
    private LocalDateTime slaDueAt;
    private List<TicketMessageDto> messages;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
