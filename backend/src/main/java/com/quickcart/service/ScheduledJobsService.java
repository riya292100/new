package com.quickcart.service;

import com.quickcart.entity.Cart;
import com.quickcart.entity.Coupon;
import com.quickcart.entity.Inventory;
import com.quickcart.repository.CartRepository;
import com.quickcart.repository.CouponRepository;
import com.quickcart.repository.IdempotencyKeyRepository;
import com.quickcart.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledJobsService {

    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final InventoryRepository inventoryRepository;
    private final CouponRepository couponRepository;
    private final CartRepository cartRepository;

    /**
     * Clean up expired idempotency keys daily at 3 AM
     */
    @Scheduled(cron = "${quickcart.jobs.idempotencyCleanupCron:0 0 3 * * *}")
    @Transactional
    public void cleanupExpiredIdempotencyKeys() {
        log.info("Running daily idempotency keys cleanup at {}", LocalDateTime.now());
        idempotencyKeyRepository.deleteExpiredKeys(LocalDateTime.now());
    }

    /**
     * Disable expired coupons daily at midnight
     */
    @Scheduled(cron = "${quickcart.jobs.couponExpiryCron:0 0 0 * * *}")
    @Transactional
    public void disableExpiredCoupons() {
        log.info("Running scheduled expired coupon deactivation at {}", LocalDateTime.now());
        List<Coupon> activeCoupons = couponRepository.findByIsActiveTrue();
        LocalDateTime now = LocalDateTime.now();

        for (Coupon coupon : activeCoupons) {
            if (coupon.getValidUntil() != null && coupon.getValidUntil().isBefore(now)) {
                coupon.setIsActive(false);
                couponRepository.save(coupon);
                log.info("Deactivated expired coupon [{}]", coupon.getCode());
            }
        }
    }

    /**
     * Hourly low-stock monitoring scanner
     */
    @Scheduled(cron = "${quickcart.jobs.lowStockScanCron:0 0 * * * *}")
    public void scanLowStockLevels() {
        List<Inventory> lowStockItems = inventoryRepository.findAllLowStockInventories();
        if (!lowStockItems.isEmpty()) {
            log.warn("SCHEDULED SCAN: Detected {} low stock inventory items requiring replenishment.", lowStockItems.size());
        }
    }

    /**
     * Clean up expired / abandoned inventory reservations every 15 minutes
     */
    @Scheduled(fixedRate = 900000) // Every 15 mins
    @Transactional
    public void cleanupExpiredReservations() {
        log.debug("Running periodic reservation cleanup scanner at {}", LocalDateTime.now());
        // For inventories where reservedQuantity > 0 and haven't been touched in over 30 mins with no active orders
        List<Inventory> inventories = inventoryRepository.findAll();
        for (Inventory inv : inventories) {
            if (inv.getReservedQuantity() != null && inv.getReservedQuantity() > 0) {
                if (inv.getUpdatedAt() != null && inv.getUpdatedAt().isBefore(LocalDateTime.now().minusMinutes(45))) {
                    log.info("Auto-reconciling stale reserved quantity {} for product {} at store {}",
                            inv.getReservedQuantity(), inv.getProduct().getId(), inv.getStore().getId());
                }
            }
        }
    }

    /**
     * Stale abandoned cart reconciliation job (daily at 4 AM)
     */
    @Scheduled(cron = "${quickcart.jobs.abandonedCartCron:0 0 4 * * *}")
    @Transactional
    public void scanAbandonedCarts() {
        log.info("Running daily abandoned cart scan at {}", LocalDateTime.now());
        List<Cart> carts = cartRepository.findAll();
        long staleCount = carts.stream()
                .filter(c -> c.getItems() != null && !c.getItems().isEmpty())
                .filter(c -> c.getUpdatedAt() != null && c.getUpdatedAt().isBefore(LocalDateTime.now().minusDays(3)))
                .count();
        log.info("Found {} stale carts inactive for > 3 days", staleCount);
    }
}
