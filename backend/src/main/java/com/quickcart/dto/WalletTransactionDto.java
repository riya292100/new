package com.quickcart.dto;

import com.quickcart.entity.WalletTransactionType;
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
public class WalletTransactionDto {
    private Long id;
    private BigDecimal amount;
    private WalletTransactionType type;
    private String description;
    private String referenceOrderNumber;
    private BigDecimal balanceAfter;
    private LocalDateTime createdAt;
}
