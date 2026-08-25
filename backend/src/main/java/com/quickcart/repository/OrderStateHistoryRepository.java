package com.quickcart.repository;

import com.quickcart.entity.OrderStateHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderStateHistoryRepository extends JpaRepository<OrderStateHistory, Long> {
    List<OrderStateHistory> findByOrderIdOrderByCreatedAtAsc(Long orderId);
}
