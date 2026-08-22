package com.quickcart.repository;

import com.quickcart.entity.DeliveryAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {
    Optional<DeliveryAssignment> findByOrderId(Long orderId);
    List<DeliveryAssignment> findByPartnerIdOrderByAssignedAtDesc(Long partnerId);
    List<DeliveryAssignment> findByPartnerIdAndStatus(Long partnerId, String status);
}
