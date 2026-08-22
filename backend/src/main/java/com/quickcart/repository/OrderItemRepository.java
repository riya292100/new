package com.quickcart.repository;

import com.quickcart.entity.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi.product.id, oi.productName, oi.productImage, SUM(oi.quantity), SUM(oi.totalPrice) " +
           "FROM OrderItem oi JOIN oi.order o WHERE o.status != com.quickcart.entity.OrderStatus.CANCELLED " +
           "GROUP BY oi.product.id, oi.productName, oi.productImage " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingProducts(Pageable pageable);
}
