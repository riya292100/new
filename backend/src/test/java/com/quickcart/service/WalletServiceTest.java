package com.quickcart.service;

import com.quickcart.dto.WalletResponse;
import com.quickcart.dto.WalletTransactionDto;
import com.quickcart.entity.*;
import com.quickcart.exception.BadRequestException;
import com.quickcart.repository.WalletRepository;
import com.quickcart.repository.WalletTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletTransactionRepository transactionRepository;

    @InjectMocks
    private WalletService walletService;

    private User mockUser;
    private Wallet mockWallet;

    @BeforeEach
    void setUp() {
        mockUser = new User("John Doe", "john@example.com", "9876543210", "password");
        mockUser.setId(1L);

        mockWallet = Wallet.builder()
                .id(10L)
                .user(mockUser)
                .balance(BigDecimal.valueOf(100.00))
                .totalEarned(BigDecimal.valueOf(100.00))
                .totalSpent(BigDecimal.ZERO)
                .cashbackRatePercentage(5.0)
                .isActive(true)
                .build();
    }

    @Test
    void getOrCreateWalletEntity_createsNewWalletWithWelcomeBonus_whenWalletDoesNotExist() {
        when(walletRepository.findByUserId(mockUser.getId())).thenReturn(Optional.empty());
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Wallet result = walletService.getOrCreateWalletEntity(mockUser);

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(100.00), result.getBalance());
        assertEquals(BigDecimal.valueOf(100.00), result.getTotalEarned());
        verify(transactionRepository, times(1)).save(any(WalletTransaction.class));
    }

    @Test
    void getOrCreateWalletEntity_returnsExistingWallet_whenPresent() {
        when(walletRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockWallet));

        Wallet result = walletService.getOrCreateWalletEntity(mockUser);

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(100.00), result.getBalance());
        verify(transactionRepository, never()).save(any(WalletTransaction.class));
    }

    @Test
    void debitForOrder_successfullyDeductsBalance_whenSufficientFunds() {
        when(walletRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockWallet));

        BigDecimal debited = walletService.debitForOrder(mockUser, BigDecimal.valueOf(50.00), "QC12345");

        assertEquals(BigDecimal.valueOf(50.00), debited);
        assertEquals(BigDecimal.valueOf(50.00), mockWallet.getBalance());
        assertEquals(BigDecimal.valueOf(50.00), mockWallet.getTotalSpent());
        verify(walletRepository, times(1)).save(mockWallet);
        verify(transactionRepository, times(1)).save(any(WalletTransaction.class));
    }

    @Test
    void debitForOrder_throwsBadRequestException_whenInsufficientFunds() {
        when(walletRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockWallet));

        assertThrows(BadRequestException.class, () ->
                walletService.debitForOrder(mockUser, BigDecimal.valueOf(200.00), "QC12345"));
    }

    @Test
    void creditCashbackForOrder_adds5PercentCashback() {
        when(walletRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockWallet));

        Order order = new Order();
        order.setOrderNumber("QC999");
        order.setItemTotal(BigDecimal.valueOf(1000.00));

        BigDecimal cashback = walletService.creditCashbackForOrder(mockUser, order);

        assertEquals(new BigDecimal("50.00"), cashback);
        assertEquals(new BigDecimal("150.00"), mockWallet.getBalance());
        assertEquals(new BigDecimal("150.00"), mockWallet.getTotalEarned());
        verify(walletRepository, times(1)).save(mockWallet);
        verify(transactionRepository, times(1)).save(any(WalletTransaction.class));
    }

    @Test
    void refundForOrder_restoresBalanceAndUpdatesSpent() {
        mockWallet.setBalance(BigDecimal.valueOf(20.00));
        mockWallet.setTotalSpent(BigDecimal.valueOf(80.00));
        when(walletRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockWallet));

        walletService.refundForOrder(mockUser, BigDecimal.valueOf(80.00), "QC12345");

        assertEquals(0, BigDecimal.valueOf(100.00).compareTo(mockWallet.getBalance()));
        assertEquals(0, BigDecimal.ZERO.compareTo(mockWallet.getTotalSpent()));
        verify(walletRepository, times(1)).save(mockWallet);
        verify(transactionRepository, times(1)).save(any(WalletTransaction.class));
    }

    @Test
    void addFunds_addsPromotionalCredits() {
        when(walletRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockWallet));
        when(transactionRepository.findByWalletIdOrderByCreatedAtDesc(any(), any()))
                .thenReturn(new PageImpl<>(new ArrayList<>()));

        WalletResponse response = walletService.addFunds(
                mockUser,
                BigDecimal.valueOf(250.00),
                "Festive Bonus",
                WalletTransactionType.CREDIT_PROMO
        );

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(350.00), response.getBalance());
        verify(walletRepository, times(1)).save(mockWallet);
    }
}
