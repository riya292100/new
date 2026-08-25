package com.quickcart.repository;

import com.quickcart.entity.FraudAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FraudAlertRepository extends JpaRepository<FraudAlert, Long> {

    Page<FraudAlert> findByStatus(String status, Pageable pageable);

    List<FraudAlert> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByStatus(String status);
}
