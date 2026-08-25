package com.quickcart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private BigDecimal balance;
    private BigDecimal totalEarned;
    private BigDecimal totalSpent;
    private Double cashbackRatePercentage;
    private String tierName;
    private BigDecimal nextTierThreshold;
    private Double tierProgressPercentage;
    private Boolean isActive;
    @Builder.Default
    private List<WalletTransactionDto> recentTransactions = new ArrayList<>();
    private LocalDateTime updatedAt;
}
