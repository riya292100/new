package com.quickcart.repository;

import com.quickcart.entity.FinancialLedgerEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialLedgerEntryRepository extends JpaRepository<FinancialLedgerEntry, Long> {
    Optional<FinancialLedgerEntry> findByTransactionId(String transactionId);
    List<FinancialLedgerEntry> findByReferenceIdOrderByCreatedAtDesc(String referenceId);
    Page<FinancialLedgerEntry> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<FinancialLedgerEntry> findByTypeOrderByCreatedAtDesc(FinancialLedgerEntry.LedgerEntryType type);
}
