package com.quickcart.repository;

import com.quickcart.entity.HourlySalesAggregate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HourlySalesAggregateRepository extends JpaRepository<HourlySalesAggregate, Long> {

    Optional<HourlySalesAggregate> findByAggregationHour(LocalDateTime aggregationHour);

    @Query("SELECT a FROM HourlySalesAggregate a WHERE a.aggregationHour >= :since ORDER BY a.aggregationHour ASC")
    List<HourlySalesAggregate> findRecentAggregates(@Param("since") LocalDateTime since);
}
