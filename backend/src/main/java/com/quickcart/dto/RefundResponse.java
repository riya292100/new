package com.quickcart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundResponse {
    private Long id;
    private String orderNumber;
    private BigDecimal amount;
    private String reason;
    private String status;
    private String refundReference;
    private LocalDateTime createdAt;
}
