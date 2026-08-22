package com.quickcart.repository;

import com.quickcart.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCodeIgnoreCaseAndIsActiveTrue(String code);
    Optional<Coupon> findByCodeIgnoreCase(String code);
    List<Coupon> findByIsActiveTrue();
    Boolean existsByCodeIgnoreCase(String code);
}
