package com.quickcart.repository;

import com.quickcart.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    long countByCouponIdAndUserId(Long couponId, Long userId);
    List<CouponUsage> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<CouponUsage> findByCouponId(Long couponId);
}
