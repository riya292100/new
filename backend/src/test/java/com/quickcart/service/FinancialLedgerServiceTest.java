package com.quickcart.service;

import com.quickcart.dto.FinancialLedgerDto;
import com.quickcart.entity.FinancialLedgerEntry;
import com.quickcart.repository.FinancialLedgerEntryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinancialLedgerServiceTest {

    @Mock
    private FinancialLedgerEntryRepository ledgerRepository;

    @InjectMocks
    private FinancialLedgerService financialLedgerService;

    @Test
    @DisplayName("Should record financial movement entry successfully")
    void testRecordMovement() {
        when(ledgerRepository.save(any(FinancialLedgerEntry.class))).thenAnswer(inv -> inv.getArgument(0));

        FinancialLedgerEntry entry = financialLedgerService.recordMovement(
                "QC123456",
                FinancialLedgerEntry.LedgerEntryType.PAYMENT,
                BigDecimal.valueOf(450.00),
                FinancialLedgerEntry.LedgerDirection.CREDIT,
                "SYSTEM_GATEWAY",
                "Payment captured via Razorpay"
        );

        assertNotNull(entry);
        assertEquals("QC123456", entry.getReferenceId());
        assertEquals(FinancialLedgerEntry.LedgerEntryType.PAYMENT, entry.getType());
        assertEquals(BigDecimal.valueOf(450.00), entry.getAmount());
        assertEquals("INR", entry.getCurrency());
        assertEquals(FinancialLedgerEntry.LedgerDirection.CREDIT, entry.getDirection());
        verify(ledgerRepository, times(1)).save(any(FinancialLedgerEntry.class));
    }

    @Test
    @DisplayName("Should record compensating reversal entry without modifying past history")
    void testRecordCompensatingEntry() {
        when(ledgerRepository.save(any(FinancialLedgerEntry.class))).thenAnswer(inv -> inv.getArgument(0));

        FinancialLedgerEntry comp = financialLedgerService.recordCompensatingEntry(
                "FIN-1001",
                "QC123456",
                BigDecimal.valueOf(450.00),
                "Customer cancellation refund",
                "ADMIN"
        );

        assertNotNull(comp);
        assertTrue(comp.getTransactionId().startsWith("COMP-"));
        assertEquals(FinancialLedgerEntry.LedgerEntryType.COMPENSATION, comp.getType());
        assertEquals(FinancialLedgerEntry.LedgerStatus.REVERSED, comp.getStatus());
        verify(ledgerRepository, times(1)).save(any(FinancialLedgerEntry.class));
    }

    @Test
    @DisplayName("Should retrieve paged ledger entries")
    void testGetLedgerEntriesPaged() {
        FinancialLedgerEntry entry = FinancialLedgerEntry.builder()
                .id(1L)
                .transactionId("FIN-ABC")
                .referenceId("QC999")
                .type(FinancialLedgerEntry.LedgerEntryType.PAYMENT)
                .amount(BigDecimal.valueOf(100.00))
                .currency("INR")
                .direction(FinancialLedgerEntry.LedgerDirection.CREDIT)
                .status(FinancialLedgerEntry.LedgerStatus.SUCCESS)
                .createdAt(LocalDateTime.now())
                .build();

        when(ledgerRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(entry)));

        Page<FinancialLedgerDto> page = financialLedgerService.getLedgerEntriesPaged(0, 10);
        assertNotNull(page);
        assertEquals(1, page.getContent().size());
        assertEquals("FIN-ABC", page.getContent().get(0).getTransactionId());
    }
}
