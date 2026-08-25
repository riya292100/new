package com.quickcart.dto;

import com.quickcart.entity.FinancialLedgerEntry;
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
public class FinancialLedgerDto {
    private Long id;
    private String transactionId;
    private String referenceId;
    private FinancialLedgerEntry.LedgerEntryType type;
    private BigDecimal amount;
    private String currency;
    private FinancialLedgerEntry.LedgerDirection direction;
    private FinancialLedgerEntry.LedgerStatus status;
    private String actor;
    private String notes;
    private LocalDateTime createdAt;
}
