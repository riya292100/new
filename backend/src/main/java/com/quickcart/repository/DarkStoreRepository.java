package com.quickcart.repository;

import com.quickcart.entity.DarkStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DarkStoreRepository extends JpaRepository<DarkStore, Long> {
    Optional<DarkStore> findByCode(String code);
    List<DarkStore> findByIsActiveTrue();
    List<DarkStore> findByCityIgnoreCaseAndIsActiveTrue(String city);
}
