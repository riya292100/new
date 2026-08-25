package com.quickcart.service;

import com.quickcart.dto.*;
import com.quickcart.entity.*;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.WalletRepository;
import com.quickcart.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {

    private static final Logger log = LoggerFactory.getLogger(WalletService.class);
    private static final BigDecimal WELCOME_BONUS = BigDecimal.valueOf(100.00);
    private static final double DEFAULT_CASHBACK_PERCENT = 5.0;

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;

    @Transactional
    public Wallet getOrCreateWalletEntity(User user) {
        return walletRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    log.info("Initializing new QuickCash wallet with welcome bonus for user: {}", user.getEmail());
                    Wallet newWallet = Wallet.builder()
                            .user(user)
                            .balance(WELCOME_BONUS)
                            .totalEarned(WELCOME_BONUS)
                            .totalSpent(BigDecimal.ZERO)
                            .cashbackRatePercentage(DEFAULT_CASHBACK_PERCENT)
                            .isActive(true)
                            .build();
                    Wallet savedWallet = walletRepository.save(newWallet);

                    WalletTransaction welcomeTx = WalletTransaction.builder()
                            .wallet(savedWallet)
                            .amount(WELCOME_BONUS)
                            .type(WalletTransactionType.CREDIT_WELCOME_BONUS)
                            .description("🎉 Welcome Bonus! ₹100 QuickCash credited to your wallet.")
                            .balanceAfter(WELCOME_BONUS)
                            .build();
                    transactionRepository.save(welcomeTx);

                    return savedWallet;
                });
    }

    @Transactional
    public WalletResponse getWallet(User user) {
        Wallet wallet = getOrCreateWalletEntity(user);
        List<WalletTransaction> recentTransactions = transactionRepository
                .findByWalletIdOrderByCreatedAtDesc(wallet.getId(), PageRequest.of(0, 10))
                .getContent();

        return mapToResponse(wallet, recentTransactions);
    }

    @Transactional(readOnly = true)
    public Page<WalletTransactionDto> getTransactions(User user, Pageable pageable) {
        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + user.getEmail()));

        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId(), pageable)
                .map(this::mapTransactionToDto);
    }

    @Transactional
    public BigDecimal debitForOrder(User user, BigDecimal amountToDebit, String orderNumber) {
        if (amountToDebit == null || amountToDebit.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        Wallet wallet = getOrCreateWalletEntity(user);

        if (wallet.getBalance().compareTo(amountToDebit) < 0) {
            throw new BadRequestException("Insufficient QuickCash wallet balance. Available: ₹" +
                    wallet.getBalance() + ", Requested: ₹" + amountToDebit);
        }

        BigDecimal newBalance = wallet.getBalance().subtract(amountToDebit);
        wallet.setBalance(newBalance);
        wallet.setTotalSpent(wallet.getTotalSpent().add(amountToDebit));
        walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .amount(amountToDebit)
                .type(WalletTransactionType.DEBIT_PURCHASE)
                .description("Redeemed QuickCash for Order #" + orderNumber)
                .referenceOrderNumber(orderNumber)
                .balanceAfter(newBalance)
                .build();
        transactionRepository.save(tx);

        log.info("Debited ₹{} from wallet for order {}. New balance: ₹{}", amountToDebit, orderNumber, newBalance);
        return amountToDebit;
    }

    @Transactional
    public BigDecimal creditCashbackForOrder(User user, Order order) {
        if (order == null || order.getItemTotal() == null) {
            return BigDecimal.ZERO;
        }

        Wallet wallet = getOrCreateWalletEntity(user);
        double rate = wallet.getCashbackRatePercentage() != null ? wallet.getCashbackRatePercentage() : DEFAULT_CASHBACK_PERCENT;
        BigDecimal cashback = order.getItemTotal()
                .multiply(BigDecimal.valueOf(rate / 100.0))
                .setScale(2, RoundingMode.HALF_UP);

        if (cashback.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal newBalance = wallet.getBalance().add(cashback);
            wallet.setBalance(newBalance);
            wallet.setTotalEarned(wallet.getTotalEarned().add(cashback));
            walletRepository.save(wallet);

            WalletTransaction tx = WalletTransaction.builder()
                    .wallet(wallet)
                    .amount(cashback)
                    .type(WalletTransactionType.CREDIT_CASHBACK)
                    .description("⚡ " + rate + "% Instant Cashback earned on Order #" + order.getOrderNumber())
                    .referenceOrderNumber(order.getOrderNumber())
                    .balanceAfter(newBalance)
                    .build();
            transactionRepository.save(tx);

            log.info("Credited ₹{} cashback to user {} for order {}. New balance: ₹{}",
                    cashback, user.getEmail(), order.getOrderNumber(), newBalance);
        }

        return cashback;
    }

    @Transactional
    public void refundForOrder(User user, BigDecimal amountToRefund, String orderNumber) {
        if (amountToRefund == null || amountToRefund.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        Wallet wallet = getOrCreateWalletEntity(user);
        BigDecimal newBalance = wallet.getBalance().add(amountToRefund);
        wallet.setBalance(newBalance);
        if (wallet.getTotalSpent().compareTo(amountToRefund) >= 0) {
            wallet.setTotalSpent(wallet.getTotalSpent().subtract(amountToRefund));
        }
        walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .amount(amountToRefund)
                .type(WalletTransactionType.CREDIT_REFUND)
                .description("Instant QuickCash Refund for Cancelled Order #" + orderNumber)
                .referenceOrderNumber(orderNumber)
                .balanceAfter(newBalance)
                .build();
        transactionRepository.save(tx);

        log.info("Refunded ₹{} QuickCash to user {} for cancelled order {}. New balance: ₹{}",
                amountToRefund, user.getEmail(), orderNumber, newBalance);
    }

    @Transactional
    public WalletResponse addFunds(User user, BigDecimal amount, String description, WalletTransactionType type) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Amount must be greater than zero");
        }

        Wallet wallet = getOrCreateWalletEntity(user);
        BigDecimal newBalance = wallet.getBalance().add(amount);
        wallet.setBalance(newBalance);
        wallet.setTotalEarned(wallet.getTotalEarned().add(amount));
        walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type(type != null ? type : WalletTransactionType.CREDIT_PROMO)
                .description(description != null && !description.isBlank() ? description : "QuickCash promotional bonus credited.")
                .balanceAfter(newBalance)
                .build();
        transactionRepository.save(tx);

        log.info("Added ₹{} promo funds to user {}. New balance: ₹{}", amount, user.getEmail(), newBalance);
        return getWallet(user);
    }

    private WalletResponse mapToResponse(Wallet wallet, List<WalletTransaction> transactions) {
        BigDecimal totalEarned = wallet.getTotalEarned() != null ? wallet.getTotalEarned() : BigDecimal.ZERO;
        String tierName = "Silver Member (5%)";
        BigDecimal nextThreshold = BigDecimal.valueOf(500.00);
        double progress = Math.min(100.0, totalEarned.doubleValue() / 500.0 * 100.0);
        double cashbackRate = 5.0;

        if (totalEarned.compareTo(BigDecimal.valueOf(2000.00)) >= 0) {
            tierName = "Platinum Star (10%)";
            nextThreshold = BigDecimal.valueOf(2000.00);
            progress = 100.0;
            cashbackRate = 10.0;
        } else if (totalEarned.compareTo(BigDecimal.valueOf(500.00)) >= 0) {
            tierName = "Gold VIP (7.5%)";
            nextThreshold = BigDecimal.valueOf(2000.00);
            progress = Math.min(100.0, ((totalEarned.doubleValue() - 500.0) / 1500.0) * 100.0);
            cashbackRate = 7.5;
        }

        return WalletResponse.builder()
                .id(wallet.getId())
                .userId(wallet.getUser().getId())
                .userFullName(wallet.getUser().getFullName())
                .balance(wallet.getBalance())
                .totalEarned(wallet.getTotalEarned())
                .totalSpent(wallet.getTotalSpent())
                .cashbackRatePercentage(cashbackRate)
                .tierName(tierName)
                .nextTierThreshold(nextThreshold)
                .tierProgressPercentage(Math.max(0.0, progress))
                .isActive(wallet.getIsActive())
                .recentTransactions(transactions.stream().map(this::mapTransactionToDto).collect(Collectors.toList()))
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }

    private WalletTransactionDto mapTransactionToDto(WalletTransaction tx) {
        return WalletTransactionDto.builder()
                .id(tx.getId())
                .amount(tx.getAmount())
                .type(tx.getType())
                .description(tx.getDescription())
                .referenceOrderNumber(tx.getReferenceOrderNumber())
                .balanceAfter(tx.getBalanceAfter())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
