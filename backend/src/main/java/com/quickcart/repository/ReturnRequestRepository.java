package com.quickcart.repository;

import com.quickcart.entity.ReturnRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    Optional<ReturnRequest> findByReturnNumber(String returnNumber);
    List<ReturnRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ReturnRequest> findByOrderId(Long orderId);
    Page<ReturnRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<ReturnRequest> findByStatusOrderByCreatedAtDesc(ReturnRequest.ReturnStatus status);
}
