package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import com.quickcart.entity.DataQualityReport;
import com.quickcart.entity.HourlySalesAggregate;
import com.quickcart.entity.ProductDemandAggregate;
import com.quickcart.service.DataPipelineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/admin/analytics", "/api/v1/admin/analytics"})
@RequiredArgsConstructor
@Tag(name = "Admin Analytics & Data Engineering ETL", description = "Endpoints for triggering and inspecting data pipelines, demand forecasting, and data quality audits")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsEtlController {

    private final DataPipelineService dataPipelineService;

    @PostMapping("/etl/sales")
    @Operation(summary = "Trigger Hourly Sales ETL Pipeline", description = "Executes batch transformation of transactional order streams into dimensional sales aggregates")
    public ResponseEntity<ApiResponse<HourlySalesAggregate>> triggerSalesEtl() {
        HourlySalesAggregate result = dataPipelineService.runHourlySalesEtl();
        return ResponseEntity.ok(ApiResponse.success("Hourly sales ETL pipeline executed successfully", result));
    }

    @PostMapping("/etl/demand")
    @Operation(summary = "Trigger Product Demand Scoring Pipeline", description = "Computes product velocity scores and moving averages across orders")
    public ResponseEntity<ApiResponse<List<ProductDemandAggregate>>> triggerDemandEtl() {
        List<ProductDemandAggregate> result = dataPipelineService.runProductDemandScoringPipeline();
        return ResponseEntity.ok(ApiResponse.success("Product demand scoring pipeline executed successfully", result));
    }

    @PostMapping("/etl/data-quality")
    @Operation(summary = "Trigger Data Quality Audit", description = "Executes validation rules across inventory, pricing, and order integrity")
    public ResponseEntity<ApiResponse<DataQualityReport>> triggerDataQualityAudit() {
        DataQualityReport report = dataPipelineService.runDataQualityAudit();
        return ResponseEntity.ok(ApiResponse.success("Data quality audit executed successfully", report));
    }

    @GetMapping("/sales-aggregates")
    @Operation(summary = "Get Recent Hourly Sales Aggregates", description = "Retrieves dimensional hourly sales aggregates for analytical dashboards")
    public ResponseEntity<ApiResponse<List<HourlySalesAggregate>>> getRecentSalesAggregates() {
        return ResponseEntity.ok(ApiResponse.success(dataPipelineService.getRecentSalesAggregates()));
    }

    @GetMapping("/demand-summary")
    @Operation(summary = "Get Product Demand Velocity Summary", description = "Retrieves top demand velocity scoring aggregates")
    public ResponseEntity<ApiResponse<List<ProductDemandAggregate>>> getTopDemandProducts() {
        return ResponseEntity.ok(ApiResponse.success(dataPipelineService.getTopDemandProducts()));
    }

    @GetMapping("/data-quality-reports")
    @Operation(summary = "Get Data Quality Audit Reports", description = "Retrieves latest data quality audit log history")
    public ResponseEntity<ApiResponse<List<DataQualityReport>>> getLatestDataQualityReports() {
        return ResponseEntity.ok(ApiResponse.success(dataPipelineService.getLatestDataQualityReports()));
    }
}
