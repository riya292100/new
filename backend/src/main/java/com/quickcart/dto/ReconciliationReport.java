package com.quickcart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReconciliationReport {

    private LocalDateTime executedAt;
    private int totalTransactionsScanned;
    private int matchedCount;
    private int discrepancyCount;
    private BigDecimal reconciledVolume;
    private List<String> discrepancies;
    private String status;
}
