package com.quickcart.service;

import com.quickcart.dto.FinancialLedgerDto;
import com.quickcart.entity.FinancialLedgerEntry;
import com.quickcart.repository.FinancialLedgerEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinancialLedgerService {

    private final FinancialLedgerEntryRepository ledgerRepository;

    /**
     * Immutable double-entry append of a financial movement.
     */
    @Transactional
    public FinancialLedgerEntry recordMovement(
            String referenceId,
            FinancialLedgerEntry.LedgerEntryType type,
            BigDecimal amount,
            FinancialLedgerEntry.LedgerDirection direction,
            String actor,
            String notes
    ) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        String txnId = "FIN-" + UUID.randomUUID().toString().substring(0, 16).toUpperCase();

        FinancialLedgerEntry entry = FinancialLedgerEntry.builder()
                .transactionId(txnId)
                .referenceId(referenceId != null ? referenceId : "UNKNOWN")
                .type(type)
                .amount(amount)
                .currency("INR")
                .direction(direction)
                .status(FinancialLedgerEntry.LedgerStatus.SUCCESS)
                .actor(actor != null ? actor : "SYSTEM")
                .notes(notes)
                .build();

        FinancialLedgerEntry saved = ledgerRepository.save(entry);
        log.info("Financial Ledger Entry [{}]: type={}, amount={} INR, direction={}, ref={}",
                saved.getTransactionId(), saved.getType(), saved.getAmount(), saved.getDirection(), saved.getReferenceId());

        return saved;
    }

    /**
     * Records a compensating reversal entry without modifying historical ledger entries.
     */
    @Transactional
    public FinancialLedgerEntry recordCompensatingEntry(
            String originalTransactionId,
            String referenceId,
            BigDecimal amount,
            String reason,
            String actor
    ) {
        String compensationTxnId = "COMP-" + UUID.randomUUID().toString().substring(0, 16).toUpperCase();

        FinancialLedgerEntry entry = FinancialLedgerEntry.builder()
                .transactionId(compensationTxnId)
                .referenceId(referenceId)
                .type(FinancialLedgerEntry.LedgerEntryType.COMPENSATION)
                .amount(amount)
                .currency("INR")
                .direction(FinancialLedgerEntry.LedgerDirection.CREDIT)
                .status(FinancialLedgerEntry.LedgerStatus.REVERSED)
                .actor(actor != null ? actor : "ADMIN_REVERSAL")
                .notes("Compensating reversal for original txn: " + originalTransactionId + ". Reason: " + reason)
                .build();

        return ledgerRepository.save(entry);
    }

    public Page<FinancialLedgerDto> getLedgerEntriesPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ledgerRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToDto);
    }

    public List<FinancialLedgerDto> getEntriesByReference(String referenceId) {
        return ledgerRepository.findByReferenceIdOrderByCreatedAtDesc(referenceId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private FinancialLedgerDto mapToDto(FinancialLedgerEntry e) {
        return FinancialLedgerDto.builder()
                .id(e.getId())
                .transactionId(e.getTransactionId())
                .referenceId(e.getReferenceId())
                .type(e.getType())
                .amount(e.getAmount())
                .currency(e.getCurrency())
                .direction(e.getDirection())
                .status(e.getStatus())
                .actor(e.getActor())
                .notes(e.getNotes())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
