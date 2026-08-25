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
}
