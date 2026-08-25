package com.quickcart.dto;

import com.quickcart.entity.SupportTicket;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSupportTicketDto {

    private Long orderId;

    @NotNull(message = "Category is required")
    private SupportTicket.TicketCategory category;

    @NotNull(message = "Priority is required")
    private SupportTicket.TicketPriority priority;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Description is required")
    private String description;
}
