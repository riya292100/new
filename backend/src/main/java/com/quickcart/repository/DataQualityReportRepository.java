package com.quickcart.repository;

import com.quickcart.entity.DataQualityReport;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DataQualityReportRepository extends JpaRepository<DataQualityReport, Long> {

    @Query("SELECT r FROM DataQualityReport r ORDER BY r.createdAt DESC")
    List<DataQualityReport> findLatestReports(Pageable pageable);
}
