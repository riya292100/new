package com.quickcart.controller;

import com.quickcart.dto.ReconciliationReport;
import com.quickcart.entity.DataQualityReport;
import com.quickcart.entity.HourlySalesAggregate;
import com.quickcart.entity.ProductDemandAggregate;
import com.quickcart.service.DataPipelineService;
import com.quickcart.service.PaymentReconciliationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AnalyticsEtlControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DataPipelineService dataPipelineService;

    @MockBean
    private PaymentReconciliationService paymentReconciliationService;

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/admin/analytics/etl/sales executes sales ETL and returns aggregate")
    void testTriggerSalesEtl() throws Exception {
        HourlySalesAggregate aggregate = HourlySalesAggregate.builder()
                .id(1L)
                .aggregationHour(LocalDateTime.now())
                .totalOrders(15L)
                .totalRevenue(new BigDecimal("12500.00"))
                .totalDeliveryFees(new BigDecimal("375.00"))
                .totalDiscounts(new BigDecimal("1200.00"))
                .totalItemsSold(45L)
                .build();

        when(dataPipelineService.runHourlySalesEtl()).thenReturn(aggregate);

        mockMvc.perform(post("/api/v1/admin/analytics/etl/sales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalOrders").value(15))
                .andExpect(jsonPath("$.data.totalRevenue").value(12500.00));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/admin/analytics/etl/demand executes product demand velocity pipeline")
    void testTriggerDemandEtl() throws Exception {
        ProductDemandAggregate demand = ProductDemandAggregate.builder()
                .productId(101L)
                .productName("Organic Farm Milk 1L")
                .unitsSold(80L)
                .velocityScore(145.5)
                .build();

        when(dataPipelineService.runProductDemandScoringPipeline()).thenReturn(List.of(demand));

        mockMvc.perform(post("/api/v1/admin/analytics/etl/demand"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].productName").value("Organic Farm Milk 1L"))
                .andExpect(jsonPath("$.data[0].velocityScore").value(145.5));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/admin/analytics/etl/data-quality executes data quality rules audit")
    void testTriggerDataQualityAudit() throws Exception {
        DataQualityReport report = DataQualityReport.builder()
                .id(1L)
                .pipelineName("DAILY_ENTERPRISE_INTEGRITY_AUDIT")
                .recordsAudited(500L)
                .anomaliesFound(0)
                .status("PASSED")
                .details("All integrity rules passed")
                .executionDurationMs(45L)
                .build();

        when(dataPipelineService.runDataQualityAudit()).thenReturn(report);

        mockMvc.perform(post("/api/v1/admin/analytics/etl/data-quality"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PASSED"))
                .andExpect(jsonPath("$.data.recordsAudited").value(500));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/admin/analytics/etl/reconciliation executes payment reconciliation")
    void testTriggerReconciliation() throws Exception {
        ReconciliationReport report = ReconciliationReport.builder()
                .executedAt(LocalDateTime.now())
                .totalTransactionsScanned(25)
                .matchedCount(25)
                .discrepancyCount(0)
                .reconciledVolume(new BigDecimal("15000.00"))
                .discrepancies(Collections.emptyList())
                .status("BALANCED")
                .build();

        when(paymentReconciliationService.runReconciliation()).thenReturn(report);

        mockMvc.perform(post("/api/v1/admin/analytics/etl/reconciliation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("BALANCED"))
                .andExpect(jsonPath("$.data.matchedCount").value(25));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/v1/admin/analytics/export/daily-report exports CSV analytics report")
    void testExportDailyAnalyticsReport() throws Exception {
        String mockCsv = "metric,value,timestamp\ntotal_revenue,15000.00,2026-08-26T12:00:00\n";
        when(dataPipelineService.generateAnalyticsExportReport()).thenReturn(mockCsv);

        mockMvc.perform(get("/api/v1/admin/analytics/export/daily-report"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"quickcart-analytics-export.csv\""))
                .andExpect(content().contentType("text/csv"))
                .andExpect(content().string(mockCsv));
    }
}
