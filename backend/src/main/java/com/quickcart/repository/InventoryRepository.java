package com.quickcart.repository;

import com.quickcart.entity.Inventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByStoreIdAndProductId(Long storeId, Long productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.store.id = :storeId AND i.product.id = :productId")
    Optional<Inventory> findByStoreIdAndProductIdWithLock(@Param("storeId") Long storeId, @Param("productId") Long productId);

    List<Inventory> findByStoreId(Long storeId);

    List<Inventory> findByProductId(Long productId);

    @Query("SELECT i FROM Inventory i WHERE i.availableQuantity <= i.lowStockThreshold")
    List<Inventory> findAllLowStockInventories();

    @Query("SELECT i FROM Inventory i WHERE i.store.id = :storeId AND i.availableQuantity <= i.lowStockThreshold")
    List<Inventory> findLowStockByStore(@Param("storeId") Long storeId);
}
