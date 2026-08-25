package com.quickcart.repository;

import com.quickcart.entity.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    Optional<SupportTicket> findByTicketNumber(String ticketNumber);
    List<SupportTicket> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<SupportTicket> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<SupportTicket> findByStatusOrderByPriorityDesc(SupportTicket.TicketStatus status);
}
