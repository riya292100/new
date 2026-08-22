package com.quickcart.repository;

import com.quickcart.entity.Order;
import com.quickcart.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findAllByOrderByCreatedAtDesc();

    Long countByStatus(OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :since")
    Long countOrdersSince(@Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status != com.quickcart.entity.OrderStatus.CANCELLED")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status != com.quickcart.entity.OrderStatus.CANCELLED AND o.createdAt >= :since")
    BigDecimal calculateRevenueSince(@Param("since") LocalDateTime since);

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatusGroup();

    @Query("SELECT CAST(o.createdAt AS date), COUNT(o), COALESCE(SUM(o.totalAmount), 0) " +
           "FROM Order o WHERE o.createdAt >= :since AND o.status != com.quickcart.entity.OrderStatus.CANCELLED " +
           "GROUP BY CAST(o.createdAt AS date) ORDER BY CAST(o.createdAt AS date) ASC")
    List<Object[]> getDailySalesAnalytics(@Param("since") LocalDateTime since);
}
