package com.quickcart.controller;

import com.quickcart.dto.AddTicketMessageDto;
import com.quickcart.dto.ApiResponse;
import com.quickcart.dto.CreateSupportTicketDto;
import com.quickcart.dto.SupportTicketDto;
import com.quickcart.entity.SupportTicket;
import com.quickcart.service.SupportTicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/support/tickets", "/api/support/tickets"})
@RequiredArgsConstructor
@Tag(name = "Customer Support", description = "Endpoints for support ticket submission, SLA tracking, and resolution")
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    @PostMapping
    @Operation(summary = "Create a new support ticket")
    public ResponseEntity<ApiResponse<SupportTicketDto>> createTicket(@Valid @RequestBody CreateSupportTicketDto request) {
        SupportTicketDto ticket = supportTicketService.createTicket(request);
        return ResponseEntity.ok(ApiResponse.success("Support ticket created", ticket));
    }

    @GetMapping("/my-tickets")
    @Operation(summary = "Get all tickets for the authenticated customer")
    public ResponseEntity<ApiResponse<List<SupportTicketDto>>> getMyTickets() {
        List<SupportTicketDto> tickets = supportTicketService.getUserTickets();
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single ticket details with full message history")
    public ResponseEntity<ApiResponse<SupportTicketDto>> getTicketById(@PathVariable Long id) {
        SupportTicketDto ticket = supportTicketService.getTicketById(id);
        return ResponseEntity.ok(ApiResponse.success(ticket));
    }

    @PostMapping("/{id}/messages")
    @Operation(summary = "Add a message or reply to an existing ticket")
    public ResponseEntity<ApiResponse<SupportTicketDto>> addMessage(
            @PathVariable Long id,
            @Valid @RequestBody AddTicketMessageDto request
    ) {
        SupportTicketDto ticket = supportTicketService.addMessage(id, request);
        return ResponseEntity.ok(ApiResponse.success("Message added", ticket));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT_AGENT') or hasRole('STORE_MANAGER')")
    @Operation(summary = "Get paginated tickets across all users (Support / Admin)")
    public ResponseEntity<ApiResponse<Page<SupportTicketDto>>> getAllTicketsAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<SupportTicketDto> tickets = supportTicketService.getAllTicketsAdmin(page, size);
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT_AGENT') or hasRole('STORE_MANAGER')")
    @Operation(summary = "Update ticket status and reassign agent")
    public ResponseEntity<ApiResponse<SupportTicketDto>> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam SupportTicket.TicketStatus status,
            @RequestParam(required = false) String assignedAgentEmail
    ) {
        SupportTicketDto ticket = supportTicketService.updateTicketStatus(id, status, assignedAgentEmail);
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated", ticket));
    }
}
