package com.quickcart.service;

import com.quickcart.entity.CartItem;
import com.quickcart.entity.DarkStore;
import com.quickcart.entity.Inventory;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.DarkStoreRepository;
import com.quickcart.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StoreFulfillmentService {

    private final DarkStoreRepository darkStoreRepository;
    private final InventoryRepository inventoryRepository;

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Determines the optimal dark store fulfillment center based on customer coordinates,
     * delivery radius, complete basket stock availability, and current store workload.
     */
    public DarkStore selectOptimalStore(BigDecimal customerLat, BigDecimal customerLng, List<CartItem> cartItems) {
        List<DarkStore> activeStores = darkStoreRepository.findByIsActiveTrue();

        if (activeStores.isEmpty()) {
            throw new ResourceNotFoundException("No active fulfillment dark stores found in the system");
        }

        if (customerLat == null || customerLng == null) {
            log.info("Customer coordinates not provided. Defaulting to primary store: {}", activeStores.get(0).getName());
            return activeStores.get(0);
        }

        double cLat = customerLat.doubleValue();
        double cLng = customerLng.doubleValue();

        // 1. Filter stores within delivery radius
        List<DarkStoreCandidate> candidates = activeStores.stream()
                .map(store -> {
                    double dist = calculateHaversineDistance(
                            cLat, cLng,
                            store.getLatitude().doubleValue(),
                            store.getLongitude().doubleValue()
                    );
                    return new DarkStoreCandidate(store, dist);
                })
                .filter(c -> c.distanceKm <= c.store.getRadiusKm().doubleValue())
                .collect(Collectors.toList());

        if (candidates.isEmpty()) {
            log.warn("No store within direct radius for ({}, {}). Selecting nearest active store.", cLat, cLng);
            return activeStores.stream()
                    .min(Comparator.comparingDouble(s -> calculateHaversineDistance(
                            cLat, cLng,
                            s.getLatitude().doubleValue(),
                            s.getLongitude().doubleValue()
                    )))
                    .orElse(activeStores.get(0));
        }

        // 2. Check full inventory availability for candidates
        List<DarkStoreCandidate> fullyStockedCandidates = candidates.stream()
                .filter(c -> isBasketAvailableInStore(c.store.getId(), cartItems))
                .collect(Collectors.toList());

        List<DarkStoreCandidate> pool = !fullyStockedCandidates.isEmpty() ? fullyStockedCandidates : candidates;

        // 3. Rank candidates: Composite Score = Distance (60%) + Store Load Ratio (40%)
        DarkStoreCandidate optimal = pool.stream()
                .min(Comparator.comparingDouble(c -> {
                    double loadRatio = c.store.getMaxCapacityOrdersPerHour() > 0
                            ? (double) c.store.getCurrentOrderLoad() / c.store.getMaxCapacityOrdersPerHour()
                            : 0.0;
                    return (c.distanceKm * 0.6) + (loadRatio * 10.0 * 0.4);
                }))
                .orElse(candidates.get(0));

        log.info("Selected optimal store: {} (distance: {} km, current load: {}) for location ({}, {})",
                optimal.store.getName(), String.format("%.2f", optimal.distanceKm), optimal.store.getCurrentOrderLoad(), cLat, cLng);

        return optimal.store;
    }

    /**
     * Validates whether all basket items have sufficient available inventory in the specified store.
     */
    public boolean isBasketAvailableInStore(Long storeId, List<CartItem> items) {
        if (items == null || items.isEmpty()) {
            return true;
        }

        for (CartItem item : items) {
            if (item.getProduct() == null) continue;
            Optional<Inventory> invOpt = inventoryRepository.findByStoreIdAndProductId(storeId, item.getProduct().getId());
            if (invOpt.isEmpty() || invOpt.get().getAvailableQuantity() < item.getQuantity()) {
                return false;
            }
        }
        return true;
    }

    /**
     * Increments or decrements active store order processing load.
     */
    @Transactional
    public void adjustStoreLoad(Long storeId, int delta) {
        darkStoreRepository.findById(storeId).ifPresent(store -> {
            int current = store.getCurrentOrderLoad() != null ? store.getCurrentOrderLoad() : 0;
            store.setCurrentOrderLoad(Math.max(0, current + delta));
            darkStoreRepository.save(store);
        });
    }

    /**
     * Calculates great-circle distance between two geographic coordinates using the Haversine formula.
     */
    public double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    private static class DarkStoreCandidate {
        final DarkStore store;
        final double distanceKm;

        DarkStoreCandidate(DarkStore store, double distanceKm) {
            this.store = store;
            this.distanceKm = distanceKm;
        }
    }
}
