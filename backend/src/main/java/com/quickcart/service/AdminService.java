package com.quickcart.service;

import com.quickcart.dto.*;
import com.quickcart.entity.*;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final ProductService productService;
    private final OrderService orderService;
    private final AuthService authService;

    public AdminDashboardStatsDto getDashboardStats() {
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        Long totalUsers = userRepository.count();
        Long totalOrders = orderRepository.count();
        Long todayOrders = orderRepository.countOrdersSince(todayStart);
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        BigDecimal todayRevenue = orderRepository.calculateRevenueSince(todayStart);

        Long pendingOrders = orderRepository.countByStatus(OrderStatus.ORDER_PLACED)
                + orderRepository.countByStatus(OrderStatus.CONFIRMED)
                + orderRepository.countByStatus(OrderStatus.PREPARING)
                + orderRepository.countByStatus(OrderStatus.PACKED)
                + orderRepository.countByStatus(OrderStatus.OUT_FOR_DELIVERY);

        Long completedOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        Long cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED);

        List<ProductResponseDto> lowStockAlerts = productService.getLowStockProducts();
        Long lowStockCount = (long) lowStockAlerts.size();

        // 7-day daily sales trend
        List<Object[]> salesData = orderRepository.getDailySalesAnalytics(sevenDaysAgo);
        List<DailySalesDto> salesTrend = new ArrayList<>();
        for (Object[] row : salesData) {
            String date = row[0] != null ? row[0].toString() : "";
            Long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            BigDecimal rev = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
            salesTrend.add(new DailySalesDto(date, count, rev));
        }

        // Order Status Distribution
        List<Object[]> statusData = orderRepository.countOrdersByStatusGroup();
        List<OrderStatusCountDto> orderStatusDistribution = new ArrayList<>();
        for (Object[] row : statusData) {
            OrderStatus status = (OrderStatus) row[0];
            Long count = (Long) row[1];
            orderStatusDistribution.add(new OrderStatusCountDto(status, count));
        }

        // Top Selling Products
        List<Object[]> topData = orderItemRepository.findTopSellingProducts(PageRequest.of(0, 5));
        List<TopProductDto> topSellingProducts = new ArrayList<>();
        for (Object[] row : topData) {
            Long pId = (Long) row[0];
            String pName = (String) row[1];
            String pImg = (String) row[2];
            Long qty = row[3] != null ? ((Number) row[3]).longValue() : 0L;
            BigDecimal rev = row[4] != null ? (BigDecimal) row[4] : BigDecimal.ZERO;
            topSellingProducts.add(new TopProductDto(pId, pName, pImg, qty, rev));
        }

        Long totalPartners = (long) deliveryPartnerRepository.findAll().size();
        Long totalCustomers = totalUsers - totalPartners;

        return new AdminDashboardStatsDto(
                totalUsers,
                totalCustomers,
                totalPartners,
                totalOrders,
                todayOrders,
                totalRevenue != null ? totalRevenue : BigDecimal.ZERO,
                todayRevenue != null ? todayRevenue : BigDecimal.ZERO,
                pendingOrders,
                completedOrders,
                cancelledOrders,
                lowStockCount,
                salesTrend,
                orderStatusDistribution,
                topSellingProducts,
                lowStockAlerts
        );
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> authService.getUserProfile(u.getId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse assignDeliveryPartner(DeliveryPartnerAssignmentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        DeliveryPartner partner = deliveryPartnerRepository.findById(request.getPartnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Partner not found with id: " + request.getPartnerId()));

        DeliveryAssignment assignment = deliveryAssignmentRepository.findByOrderId(order.getId())
                .orElseGet(() -> new DeliveryAssignment(order, partner));

        assignment.setPartner(partner);
        assignment.setStatus("ASSIGNED");
        deliveryAssignmentRepository.save(assignment);

        if (order.getStatus() == OrderStatus.ORDER_PLACED) {
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
        }

        return orderService.mapToDto(order);
    }

    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }
}
