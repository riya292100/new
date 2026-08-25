package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "financial_ledger_entries", indexes = {
        @Index(name = "idx_ledger_txn_id", columnList = "transactionId"),
        @Index(name = "idx_ledger_ref_id", columnList = "referenceId"),
        @Index(name = "idx_ledger_type", columnList = "type"),
        @Index(name = "idx_ledger_created_at", columnList = "createdAt")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialLedgerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String transactionId;

    @Column(nullable = false, length = 100)
    private String referenceId; // e.g. Order number, refund ref, wallet tx id

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LedgerEntryType type;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Builder.Default
    @Column(nullable = false, length = 10)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private LedgerDirection direction; // CREDIT or DEBIT

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LedgerStatus status;

    @Column(length = 100)
    private String actor;

    @Column(length = 500)
    private String notes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public enum LedgerEntryType {
        PAYMENT,
        REFUND,
        WALLET_CREDIT,
        WALLET_DEBIT,
        LOYALTY_CASHBACK,
        COUPON_DISCOUNT,
        DELIVERY_FEE,
        PLATFORM_FEE,
        COMPENSATION
    }

    public enum LedgerDirection {
        CREDIT,
        DEBIT
    }

    public enum LedgerStatus {
        SUCCESS,
        REVERSED,
        PENDING,
        FAILED
    }
}
