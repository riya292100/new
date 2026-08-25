package com.quickcart.repository;

import com.quickcart.entity.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByInventoryIdOrderByCreatedAtDesc(Long inventoryId);
    Page<InventoryTransaction> findByInventoryIdOrderByCreatedAtDesc(Long inventoryId, Pageable pageable);
    List<InventoryTransaction> findByReferenceOrderNumber(String referenceOrderNumber);
}
