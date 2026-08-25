package com.quickcart.service;

import com.quickcart.dto.AddTicketMessageDto;
import com.quickcart.dto.CreateSupportTicketDto;
import com.quickcart.dto.SupportTicketDto;
import com.quickcart.dto.TicketMessageDto;
import com.quickcart.entity.*;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.SupportTicketRepository;
import com.quickcart.repository.TicketMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final TicketMessageRepository ticketMessageRepository;
    private final OrderRepository orderRepository;
    private final AuthService authService;
    private final NotificationService notificationService;

    @Transactional
    public SupportTicketDto createTicket(CreateSupportTicketDto request) {
        User currentUser = authService.getCurrentUserEntity();
        Order order = null;
        if (request.getOrderId() != null) {
            order = orderRepository.findById(request.getOrderId()).orElse(null);
        }

        String ticketNumber = "TICK-" + System.currentTimeMillis() % 100000000;

        // SLA calculation: URGENT = 2h, HIGH = 6h, MEDIUM = 12h, LOW = 24h
        LocalDateTime sla = switch (request.getPriority()) {
            case URGENT -> LocalDateTime.now().plusHours(2);
            case HIGH -> LocalDateTime.now().plusHours(6);
            case MEDIUM -> LocalDateTime.now().plusHours(12);
            case LOW -> LocalDateTime.now().plusHours(24);
        };

        SupportTicket ticket = SupportTicket.builder()
                .ticketNumber(ticketNumber)
                .user(currentUser)
                .order(order)
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(SupportTicket.TicketStatus.OPEN)
                .subject(request.getSubject().trim())
                .description(request.getDescription().trim())
                .slaDueAt(sla)
                .build();

        SupportTicket saved = supportTicketRepository.save(ticket);

        // Add initial message from user
        TicketMessage initialMsg = TicketMessage.builder()
                .ticket(saved)
                .senderName(currentUser.getFullName())
                .senderRole("CUSTOMER")
                .message(request.getDescription().trim())
                .isInternalNote(false)
                .build();
        ticketMessageRepository.save(initialMsg);

        log.info("Created support ticket {} for user {}", ticketNumber, currentUser.getEmail());
        return mapToDto(saved);
    }

    public List<SupportTicketDto> getUserTickets() {
        User currentUser = authService.getCurrentUserEntity();
        return supportTicketRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public SupportTicketDto getTicketById(Long id) {
        User currentUser = authService.getCurrentUserEntity();
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        boolean isStaff = currentUser.getRoles().stream().anyMatch(r ->
                r.getName() == ERole.ROLE_ADMIN ||
                r.getName() == ERole.ROLE_SUPPORT_AGENT ||
                r.getName() == ERole.ROLE_STORE_MANAGER);

        if (!isStaff && !ticket.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Unauthorized access to ticket");
        }

        return mapToDto(ticket);
    }

    public Page<SupportTicketDto> getAllTicketsAdmin(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return supportTicketRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToDto);
    }

    @Transactional
    public SupportTicketDto addMessage(Long ticketId, AddTicketMessageDto request) {
        User currentUser = authService.getCurrentUserEntity();
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        boolean isStaff = currentUser.getRoles().stream().anyMatch(r ->
                r.getName() == ERole.ROLE_ADMIN ||
                r.getName() == ERole.ROLE_SUPPORT_AGENT ||
                r.getName() == ERole.ROLE_STORE_MANAGER);

        if (!isStaff && !ticket.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Unauthorized access to ticket");
        }

        String role = isStaff ? "SUPPORT_AGENT" : "CUSTOMER";

        TicketMessage msg = TicketMessage.builder()
                .ticket(ticket)
                .senderName(currentUser.getFullName())
                .senderRole(role)
                .message(request.getMessage().trim())
                .isInternalNote(isStaff && Boolean.TRUE.equals(request.getIsInternalNote()))
                .build();

        ticketMessageRepository.save(msg);

        if (!isStaff) {
            // Customer replied -> status becomes IN_PROGRESS
            if (ticket.getStatus() == SupportTicket.TicketStatus.WAITING_FOR_CUSTOMER) {
                ticket.setStatus(SupportTicket.TicketStatus.IN_PROGRESS);
                supportTicketRepository.save(ticket);
            }
        } else if (!Boolean.TRUE.equals(request.getIsInternalNote())) {
            // Staff replied publicly -> status becomes WAITING_FOR_CUSTOMER
            ticket.setStatus(SupportTicket.TicketStatus.WAITING_FOR_CUSTOMER);
            supportTicketRepository.save(ticket);

            notificationService.createNotification(
                    ticket.getUser().getId(),
                    "New Support Message",
                    "Support agent replied to your ticket #" + ticket.getTicketNumber(),
                    "SUPPORT",
                    ticket.getTicketNumber()
            );
        }

        return mapToDto(ticket);
    }

    @Transactional
    public SupportTicketDto updateTicketStatus(Long ticketId, SupportTicket.TicketStatus status, String assignedAgentEmail) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        ticket.setStatus(status);
        if (assignedAgentEmail != null && !assignedAgentEmail.isBlank()) {
            ticket.setAssignedAgentEmail(assignedAgentEmail.trim());
        }

        SupportTicket saved = supportTicketRepository.save(ticket);
        return mapToDto(saved);
    }

    private SupportTicketDto mapToDto(SupportTicket t) {
        List<TicketMessageDto> msgDtos = ticketMessageRepository.findByTicketIdOrderByCreatedAtAsc(t.getId()).stream()
                .map(m -> TicketMessageDto.builder()
                        .id(m.getId())
                        .senderName(m.getSenderName())
                        .senderRole(m.getSenderRole())
                        .message(m.getMessage())
                        .isInternalNote(m.getIsInternalNote())
                        .createdAt(m.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return SupportTicketDto.builder()
                .id(t.getId())
                .ticketNumber(t.getTicketNumber())
                .userId(t.getUser().getId())
                .userEmail(t.getUser().getEmail())
                .userName(t.getUser().getFullName())
                .orderId(t.getOrder() != null ? t.getOrder().getId() : null)
                .orderNumber(t.getOrder() != null ? t.getOrder().getOrderNumber() : null)
                .category(t.getCategory())
                .priority(t.getPriority())
                .status(t.getStatus())
                .subject(t.getSubject())
                .description(t.getDescription())
                .assignedAgentEmail(t.getAssignedAgentEmail())
                .slaDueAt(t.getSlaDueAt())
                .messages(msgDtos)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
