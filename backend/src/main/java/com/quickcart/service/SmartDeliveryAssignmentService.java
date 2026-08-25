package com.quickcart.service;

import com.quickcart.entity.*;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.DeliveryAssignmentRepository;
import com.quickcart.repository.DeliveryPartnerRepository;
import com.quickcart.repository.DeliveryZoneRepository;
import com.quickcart.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmartDeliveryAssignmentService {

    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final DeliveryZoneRepository deliveryZoneRepository;
    private final OrderRepository orderRepository;
    private final com.quickcart.event.DomainEventPublisher domainEventPublisher;

    /**
     * Smart heuristic scoring for partner assignment:
     * Score = (ZoneMatch * 50) + (IsAvailable * 30) + (Rating * 10) - (ActiveDeliveries * 15) - (DistanceKm * 2)
     */
    @Transactional
    public Optional<DeliveryPartner> allocateBestPartner(Order order) {
        if (order == null) return Optional.empty();

        List<DeliveryPartner> onlinePartners = deliveryPartnerRepository.findByIsAvailableTrue();
        if (onlinePartners.isEmpty()) {
            log.warn("No online delivery partners available for order #{}", order.getOrderNumber());
            return Optional.empty();
        }

        Address destination = order.getAddress();
        String targetPincode = destination != null ? destination.getPincode() : null;

        DeliveryPartner bestPartner = onlinePartners.stream()
                .max(Comparator.comparingDouble(partner -> calculateSuitabilityScore(partner, targetPincode, destination)))
                .orElse(null);

        if (bestPartner != null) {
            log.info("Allocated best delivery partner: {} (id={}) for order #{}",
                    bestPartner.getUser().getFullName(), bestPartner.getId(), order.getOrderNumber());

            DeliveryAssignment assignment = deliveryAssignmentRepository.findByOrderId(order.getId())
                    .orElseGet(() -> new DeliveryAssignment(order, bestPartner));

            assignment.setPartner(bestPartner);
            assignment.setStatus("ASSIGNED");
            assignment.setAssignedAt(LocalDateTime.now());
            deliveryAssignmentRepository.save(assignment);

            order.setDeliveryAssignment(assignment);
            orderRepository.save(order);

            domainEventPublisher.publish(com.quickcart.event.OrderEvents.DeliveryAssignedEvent.builder()
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .partnerId(bestPartner.getId())
                    .partnerName(bestPartner.getUser().getFullName())
                    .partnerPhone(bestPartner.getUser().getPhone())
                    .build());

            return Optional.of(bestPartner);
        }

        return Optional.empty();
    }

    public double calculateSuitabilityScore(DeliveryPartner partner, String targetPincode, Address destination) {
        double score = 0.0;

        // 1. Availability check
        if (Boolean.TRUE.equals(partner.getIsAvailable())) {
            score += 30.0;
        }

        // 2. Partner rating weight (0 to 50 points)
        if (partner.getRating() != null) {
            score += partner.getRating().doubleValue() * 10.0;
        }

        // 3. Zone affinity bonus
        if (targetPincode != null && partner.getUser() != null) {
            // Check delivery zones
            List<DeliveryZone> zones = deliveryZoneRepository.findByPincode(targetPincode);
            if (!zones.isEmpty()) {
                score += 40.0;
            }
        }

        // 4. Distance heuristic (Euclidean distance approximation in km)
        if (destination != null && destination.getLatitude() != null && destination.getLongitude() != null &&
                partner.getCurrentLatitude() != null && partner.getCurrentLongitude() != null) {
            double latDiff = destination.getLatitude().doubleValue() - partner.getCurrentLatitude().doubleValue();
            double lonDiff = destination.getLongitude().doubleValue() - partner.getCurrentLongitude().doubleValue();
            double approxDistKm = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111.0;
            score -= Math.min(30.0, approxDistKm * 3.0);
        }

        return score;
    }
}
