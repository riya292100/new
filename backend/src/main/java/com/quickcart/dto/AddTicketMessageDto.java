package com.quickcart.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddTicketMessageDto {

    @NotBlank(message = "Message content is required")
    private String message;

    private Boolean isInternalNote = false;
}
