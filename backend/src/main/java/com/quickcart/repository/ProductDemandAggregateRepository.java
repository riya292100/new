package com.quickcart.repository;

import com.quickcart.entity.ProductDemandAggregate;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductDemandAggregateRepository extends JpaRepository<ProductDemandAggregate, Long> {

    @Query("SELECT p FROM ProductDemandAggregate p ORDER BY p.velocityScore DESC")
    List<ProductDemandAggregate> findTopVelocityProducts(Pageable pageable);

    @Query("SELECT p FROM ProductDemandAggregate p ORDER BY p.totalRevenue DESC")
    List<ProductDemandAggregate> findTopRevenueProducts(Pageable pageable);
}
