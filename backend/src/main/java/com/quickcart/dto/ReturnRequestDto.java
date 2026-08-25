package com.quickcart.dto;

import com.quickcart.entity.ReturnRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnRequestDto {
    private Long id;
    private String returnNumber;
    private Long orderId;
    private String orderNumber;
    private Long userId;
    private String userEmail;
    private String reason;
    private ReturnRequest.ReturnStatus status;
    private BigDecimal refundAmount;
    private String adminNotes;
    private LocalDateTime pickupScheduledAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
