package com.quickcart.repository;

import com.quickcart.entity.DeliveryZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryZoneRepository extends JpaRepository<DeliveryZone, Long> {
    Optional<DeliveryZone> findByZoneCode(String zoneCode);
    List<DeliveryZone> findByIsActiveTrue();
    List<DeliveryZone> findByCityIgnoreCaseAndIsActiveTrue(String city);
}
