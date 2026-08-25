package com.quickcart.service;

import com.quickcart.entity.*;
import com.quickcart.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Enterprise Data Engineering & Data Pipeline Service.
 * Implements transactional-to-analytical ETL extraction, aggregation,
 * product demand velocity scoring, and automated data quality audits.
 */
@Service
@RequiredArgsConstructor
public class DataPipelineService {

    private static final Logger logger = LoggerFactory.getLogger(DataPipelineService.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final HourlySalesAggregateRepository hourlySalesAggregateRepository;
    private final ProductDemandAggregateRepository productDemandAggregateRepository;
    private final DataQualityReportRepository dataQualityReportRepository;

    /**
     * Hourly Sales Aggregation ETL Pipeline.
     * Extracts raw transactional order streams, computes dimensional aggregates, and loads summary tables.
     */
    @Transactional
    @Scheduled(cron = "0 0 * * * *") // Runs every hour
    public HourlySalesAggregate runHourlySalesEtl() {
        long startTime = System.currentTimeMillis();
        LocalDateTime currentHour = LocalDateTime.now().truncatedTo(ChronoUnit.HOURS);
        LocalDateTime windowStart = currentHour.minusHours(1);

        logger.info("Starting Hourly Sales ETL Pipeline for window: {} to {}", windowStart, currentHour);

        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        long totalOrders = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalDeliveryFees = BigDecimal.ZERO;
        BigDecimal totalDiscounts = BigDecimal.ZERO;
        long totalItemsSold = 0;

        for (Order order : orders) {
            if (order.getStatus() != OrderStatus.CANCELLED) {
                totalOrders++;
                totalRevenue = totalRevenue.add(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO);
                totalDeliveryFees = totalDeliveryFees.add(order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO);
                totalDiscounts = totalDiscounts.add(order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO);
                if (order.getItems() != null) {
                    totalItemsSold += order.getItems().stream().mapToInt(OrderItem::getQuantity).sum();
                }
            }
        }

        HourlySalesAggregate aggregate = hourlySalesAggregateRepository
                .findByAggregationHour(windowStart)
                .orElse(HourlySalesAggregate.builder().aggregationHour(windowStart).build());

        aggregate.setTotalOrders(totalOrders);
        aggregate.setTotalRevenue(totalRevenue);
        aggregate.setTotalDeliveryFees(totalDeliveryFees);
        aggregate.setTotalDiscounts(totalDiscounts);
        aggregate.setTotalItemsSold(totalItemsSold);

        HourlySalesAggregate saved = hourlySalesAggregateRepository.save(aggregate);
        logger.info("Completed Hourly Sales ETL Pipeline in {}ms. Saved aggregate ID: {}",
                (System.currentTimeMillis() - startTime), saved.getId());
        return saved;
    }

    /**
     * Product Demand & Velocity Scoring Pipeline.
     * Computes real-time velocity metrics for recommendation and replenishment engines.
     */
    @Transactional
    @Scheduled(cron = "0 30 * * * *") // Runs at :30 past every hour
    public List<ProductDemandAggregate> runProductDemandScoringPipeline() {
        long startTime = System.currentTimeMillis();
        LocalDateTime periodEnd = LocalDateTime.now();
        LocalDateTime periodStart = periodEnd.minusDays(7);

        logger.info("Starting Product Demand Scoring Pipeline for period: {} to {}", periodStart, periodEnd);

        List<Object[]> topSelling = orderItemRepository.findTopSellingProducts(PageRequest.of(0, 50));
        List<ProductDemandAggregate> aggregates = new ArrayList<>();

        for (Object[] row : topSelling) {
            Long productId = (Long) row[0];
            String productName = (String) row[1];
            Long unitsSold = ((Number) row[3]).longValue();
            BigDecimal totalRevenue = (BigDecimal) row[4];

            // Velocity formula: (Units * 1.5) + (Revenue * 0.05)
            double velocityScore = (unitsSold * 1.5) + (totalRevenue.doubleValue() * 0.05);

            ProductDemandAggregate demand = ProductDemandAggregate.builder()
                    .productId(productId)
                    .productName(productName)
                    .unitsSold(unitsSold)
                    .totalRevenue(totalRevenue)
                    .velocityScore(velocityScore)
                    .periodStart(periodStart)
                    .periodEnd(periodEnd)
                    .build();

            aggregates.add(productDemandAggregateRepository.save(demand));
        }

        logger.info("Completed Product Demand Scoring Pipeline in {}ms. Processed {} products",
                (System.currentTimeMillis() - startTime), aggregates.size());
        return aggregates;
    }

    /**
     * Data Quality & Integrity Rules Engine.
     * Executes automated verification checks across transactions, catalog, and inventory.
     */
    @Transactional
    public DataQualityReport runDataQualityAudit() {
        long startTime = System.currentTimeMillis();
        logger.info("Executing Enterprise Data Quality Rules Audit");

        long recordsAudited = 0;
        int anomalies = 0;
        StringBuilder reportDetails = new StringBuilder();

        // Rule 1: Inventory stock quantity non-negativity
        List<Product> products = productRepository.findAll();
        recordsAudited += products.size();
        for (Product p : products) {
            if (p.getStockQuantity() != null && p.getStockQuantity() < 0) {
                anomalies++;
                reportDetails.append(String.format("Anomaly: Negative stock on product '%s' (ID: %d, Stock: %d)\n",
                        p.getName(), p.getId(), p.getStockQuantity()));
            }
            if (p.getSellingPrice() != null && p.getMrp() != null &&
                    p.getSellingPrice().compareTo(p.getMrp()) > 0) {
                anomalies++;
                reportDetails.append(String.format("Anomaly: Selling price exceeds MRP on product '%s' (ID: %d)\n",
                        p.getName(), p.getId()));
            }
        }

        // Rule 2: Order financial total integrity
        List<Order> orders = orderRepository.findAll();
        recordsAudited += orders.size();
        for (Order o : orders) {
            if (o.getTotalAmount() != null && o.getTotalAmount().compareTo(BigDecimal.ZERO) < 0) {
                anomalies++;
                reportDetails.append(String.format("Anomaly: Negative order total on Order #%s\n", o.getOrderNumber()));
            }
        }

        String status = anomalies == 0 ? "PASSED" : (anomalies < 5 ? "WARNING" : "FAILED");
        if (anomalies == 0) {
            reportDetails.append("All integrity rules passed successfully: 0 data anomalies detected across ")
                    .append(recordsAudited).append(" records.");
        }

        long durationMs = System.currentTimeMillis() - startTime;

        DataQualityReport report = DataQualityReport.builder()
                .pipelineName("DAILY_ENTERPRISE_INTEGRITY_AUDIT")
                .recordsAudited(recordsAudited)
                .anomaliesFound(anomalies)
                .status(status)
                .details(reportDetails.length() > 2000 ? reportDetails.substring(0, 2000) : reportDetails.toString())
                .executionDurationMs(durationMs)
                .build();

        DataQualityReport saved = dataQualityReportRepository.save(report);
        logger.info("Data Quality Audit finished in {}ms. Status: {}, Anomalies: {}", durationMs, status, anomalies);
        return saved;
    }

    public List<HourlySalesAggregate> getRecentSalesAggregates() {
        return hourlySalesAggregateRepository.findRecentAggregates(LocalDateTime.now().minusDays(7));
    }

    public List<ProductDemandAggregate> getTopDemandProducts() {
        return productDemandAggregateRepository.findTopVelocityProducts(PageRequest.of(0, 20));
    }

    public List<DataQualityReport> getLatestDataQualityReports() {
        return dataQualityReportRepository.findLatestReports(PageRequest.of(0, 10));
    }
}
