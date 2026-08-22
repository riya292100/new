package com.quickcart.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsDto {
    private Long totalUsers;
    private Long totalCustomers;
    private Long totalDeliveryPartners;
    private Long totalOrders;
    private Long todayOrders;
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private Long pendingOrders;
    private Long completedOrders;
    private Long cancelledOrders;
    private Long lowStockProductCount;

    private List<DailySalesDto> salesTrend;
    private List<OrderStatusCountDto> orderStatusDistribution;
    private List<TopProductDto> topSellingProducts;
    private List<ProductResponseDto> lowStockAlerts;
}
