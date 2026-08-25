package com.quickcart.service;

import com.quickcart.entity.*;
import com.quickcart.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataPipelineServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private HourlySalesAggregateRepository hourlySalesAggregateRepository;

    @Mock
    private ProductDemandAggregateRepository productDemandAggregateRepository;

    @Mock
    private DataQualityReportRepository dataQualityReportRepository;

    @InjectMocks
    private DataPipelineService dataPipelineService;

    @Test
    @DisplayName("Hourly Sales ETL aggregates revenue, delivery fees, and order counts accurately")
    void testRunHourlySalesEtl() {
        Order order = Order.builder()
                .id(1L)
                .orderNumber("QC-10001")
                .status(OrderStatus.DELIVERED)
                .totalAmount(new BigDecimal("550.00"))
                .deliveryFee(new BigDecimal("25.00"))
                .discountAmount(new BigDecimal("50.00"))
                .items(List.of(
                        OrderItem.builder().quantity(2).build(),
                        OrderItem.builder().quantity(3).build()
                ))
                .build();

        when(orderRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(order));
        when(hourlySalesAggregateRepository.findByAggregationHour(any())).thenReturn(Optional.empty());
        when(hourlySalesAggregateRepository.save(any(HourlySalesAggregate.class))).thenAnswer(invocation -> {
            HourlySalesAggregate agg = invocation.getArgument(0);
            agg.setId(101L);
            return agg;
        });

        HourlySalesAggregate result = dataPipelineService.runHourlySalesEtl();

        assertNotNull(result);
        assertEquals(1L, result.getTotalOrders());
        assertEquals(new BigDecimal("550.00"), result.getTotalRevenue());
        assertEquals(new BigDecimal("25.00"), result.getTotalDeliveryFees());
        assertEquals(new BigDecimal("50.00"), result.getTotalDiscounts());
        assertEquals(5L, result.getTotalItemsSold());
        verify(hourlySalesAggregateRepository, times(1)).save(any(HourlySalesAggregate.class));
    }

    @Test
    @DisplayName("Product Demand Scoring pipeline calculates velocity scores correctly")
    void testRunProductDemandScoringPipeline() {
        List<Object[]> rows = Collections.singletonList(new Object[]{1L, "Fresh Alphonso Mangoes", "mango.jpg", 10L, new BigDecimal("800.00")});
        when(orderItemRepository.findTopSellingProducts(any(Pageable.class))).thenReturn(rows);
        when(productDemandAggregateRepository.save(any(ProductDemandAggregate.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<ProductDemandAggregate> result = dataPipelineService.runProductDemandScoringPipeline();

        assertNotNull(result);
        assertEquals(1, result.size());
        ProductDemandAggregate demand = result.get(0);
        assertEquals("Fresh Alphonso Mangoes", demand.getProductName());
        assertEquals(10L, demand.getUnitsSold());
        // velocityScore = (10 * 1.5) + (800 * 0.05) = 15 + 40 = 55.0
        assertEquals(55.0, demand.getVelocityScore(), 0.001);
    }

    @Test
    @DisplayName("Data Quality Audit passes cleanly when no anomalies exist")
    void testRunDataQualityAudit_Clean() {
        Product p = Product.builder()
                .id(1L)
                .name("Organic Milk")
                .stockQuantity(50)
                .sellingPrice(new BigDecimal("60.00"))
                .mrp(new BigDecimal("70.00"))
                .build();

        Order o = Order.builder()
                .id(1L)
                .orderNumber("QC-10001")
                .totalAmount(new BigDecimal("60.00"))
                .build();

        when(productRepository.findAll()).thenReturn(List.of(p));
        when(orderRepository.findAll()).thenReturn(List.of(o));
        when(dataQualityReportRepository.save(any(DataQualityReport.class))).thenAnswer(invocation -> {
            DataQualityReport rep = invocation.getArgument(0);
            rep.setId(201L);
            return rep;
        });

        DataQualityReport report = dataPipelineService.runDataQualityAudit();

        assertNotNull(report);
        assertEquals("PASSED", report.getStatus());
        assertEquals(0, report.getAnomaliesFound());
        assertEquals(2L, report.getRecordsAudited());
    }

    @Test
    @DisplayName("Data Quality Audit detects negative inventory and pricing anomalies")
    void testRunDataQualityAudit_WithAnomalies() {
        Product badProduct = Product.builder()
                .id(2L)
                .name("Glitchy Snack")
                .stockQuantity(-5) // Anomaly 1: negative stock
                .sellingPrice(new BigDecimal("150.00"))
                .mrp(new BigDecimal("100.00")) // Anomaly 2: selling > MRP
                .build();

        when(productRepository.findAll()).thenReturn(List.of(badProduct));
        when(orderRepository.findAll()).thenReturn(Collections.emptyList());
        when(dataQualityReportRepository.save(any(DataQualityReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DataQualityReport report = dataPipelineService.runDataQualityAudit();

        assertNotNull(report);
        assertEquals("WARNING", report.getStatus());
        assertEquals(2, report.getAnomaliesFound());
    }
}
