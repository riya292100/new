package com.quickcart.service;

import com.quickcart.dto.DeliveryLocationUpdateDto;
import com.quickcart.dto.OrderResponse;
import com.quickcart.entity.*;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.DeliveryAssignmentRepository;
import com.quickcart.repository.DeliveryPartnerRepository;
import com.quickcart.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryPartnerService {

    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final AuthService authService;
    private final OrderTrackingWebSocketService webSocketService;

    public DeliveryPartner getCurrentPartner() {
        com.quickcart.security.UserDetailsImpl user = authService.getCurrentAuthenticatedUser();
        return deliveryPartnerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner profile not found for user: " + user.getId()));
    }

    public List<OrderResponse> getAssignedDeliveries() {
        DeliveryPartner partner = getCurrentPartner();
        List<DeliveryAssignment> assignments = deliveryAssignmentRepository.findByPartnerIdOrderByAssignedAtDesc(partner.getId());

        return assignments.stream()
                .map(a -> orderService.mapToDto(a.getOrder()))
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getPendingDeliveries() {
        return orderRepository.findByStatus(OrderStatus.CONFIRMED).stream()
                .map(orderService::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse acceptDelivery(Long orderId) {
        DeliveryPartner partner = getCurrentPartner();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        DeliveryAssignment assignment = deliveryAssignmentRepository.findByOrderId(orderId)
                .orElseGet(() -> new DeliveryAssignment(order, partner));

        assignment.setPartner(partner);
        assignment.setStatus("ACCEPTED");
        assignment.setAcceptedAt(LocalDateTime.now());
        deliveryAssignmentRepository.save(assignment);

        order.setStatus(OrderStatus.PREPARING);
        orderRepository.save(order);

        OrderResponse response = orderService.mapToDto(order);
        webSocketService.broadcastOrderStatusUpdate(response);
        return response;
    }

    @Transactional
    public OrderResponse rejectDelivery(Long orderId) {
        DeliveryPartner partner = getCurrentPartner();
        DeliveryAssignment assignment = deliveryAssignmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("No assignment found for order id: " + orderId));

        if (assignment.getPartner().getId().equals(partner.getId())) {
            assignment.setStatus("REJECTED");
            deliveryAssignmentRepository.save(assignment);
        }

        Order order = assignment.getOrder();
        return orderService.mapToDto(order);
    }

    @Transactional
    public OrderResponse updateDeliveryStatus(Long orderId, OrderStatus status) {
        DeliveryPartner partner = getCurrentPartner();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        DeliveryAssignment assignment = deliveryAssignmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found for order id: " + orderId));

        order.setStatus(status);
        if (status == OrderStatus.OUT_FOR_DELIVERY) {
            assignment.setStatus("PICKED_UP");
            assignment.setPickedUpAt(LocalDateTime.now());
        } else if (status == OrderStatus.DELIVERED) {
            assignment.setStatus("DELIVERED");
            assignment.setDeliveredAt(LocalDateTime.now());
            order.setDeliveredAt(LocalDateTime.now());
            partner.setTotalDeliveries(partner.getTotalDeliveries() + 1);
            deliveryPartnerRepository.save(partner);
        }

        deliveryAssignmentRepository.save(assignment);
        Order saved = orderRepository.save(order);

        OrderResponse response = orderService.mapToDto(saved);
        webSocketService.broadcastOrderStatusUpdate(response);
        return response;
    }

    @Transactional
    public void updateLocation(DeliveryLocationUpdateDto dto) {
        DeliveryPartner partner = getCurrentPartner();
        partner.setCurrentLatitude(dto.getLatitude());
        partner.setCurrentLongitude(dto.getLongitude());
        deliveryPartnerRepository.save(partner);

        // Broadcast to all active assigned orders
        List<DeliveryAssignment> activeAssignments = deliveryAssignmentRepository.findByPartnerIdAndStatus(partner.getId(), "PICKED_UP");
        for (DeliveryAssignment assignment : activeAssignments) {
            webSocketService.broadcastDeliveryLocation(
                    assignment.getOrder().getId(),
                    dto.getLatitude(),
                    dto.getLongitude(),
                    assignment.getOrder().getStatus().name()
            );
        }
    }

    public List<DeliveryPartner> getAllDeliveryPartners() {
        return deliveryPartnerRepository.findAll();
    }
}
