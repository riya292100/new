package com.quickcart.service;

import com.quickcart.dto.InventoryDto;
import com.quickcart.dto.InventoryStockAdjustmentRequest;
import com.quickcart.entity.*;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final DarkStoreRepository darkStoreRepository;
    private final ProductRepository productRepository;
    private final com.quickcart.event.DomainEventPublisher domainEventPublisher;

    public List<InventoryDto> getInventoriesByStore(Long storeId) {
        return inventoryRepository.findByStoreId(storeId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<InventoryDto> getLowStockAlerts(Long storeId) {
        List<Inventory> list = (storeId != null)
                ? inventoryRepository.findLowStockByStore(storeId)
                : inventoryRepository.findAllLowStockInventories();

        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public InventoryDto getInventoryByStoreAndProduct(Long storeId, Long productId) {
        Inventory inv = inventoryRepository.findByStoreIdAndProductId(storeId, productId)
                .orElseGet(() -> getOrCreateDefaultInventory(storeId, productId));
        return mapToDto(inv);
    }

    @Transactional
    public Inventory getOrCreateDefaultInventory(Long storeId, Long productId) {
        Optional<Inventory> existing = inventoryRepository.findByStoreIdAndProductId(storeId, productId);
        if (existing.isPresent()) {
            return existing.get();
        }

        DarkStore store = darkStoreRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        Inventory newInv = Inventory.builder()
                .store(store)
                .product(product)
                .availableQuantity(product.getStockQuantity() != null ? product.getStockQuantity() : 50)
                .reservedQuantity(0)
                .lowStockThreshold(product.getLowStockThreshold() != null ? product.getLowStockThreshold() : 10)
                .build();

        return inventoryRepository.save(newInv);
    }

    @Transactional
    @CacheEvict(value = {"products", "productDetails"}, allEntries = true)
    public InventoryDto adjustStock(InventoryStockAdjustmentRequest request) {
        DarkStore store = darkStoreRepository.findById(request.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + request.getStoreId()));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        Inventory inventory = inventoryRepository.findByStoreIdAndProductIdWithLock(store.getId(), product.getId())
                .orElseGet(() -> Inventory.builder()
                        .store(store)
                        .product(product)
                        .availableQuantity(0)
                        .reservedQuantity(0)
                        .lowStockThreshold(10)
                        .build());

        int qty = request.getQuantity();
        String type = request.getType().toUpperCase();

        if ("STOCK_IN".equals(type) || "ADD".equals(type)) {
            inventory.setAvailableQuantity(inventory.getAvailableQuantity() + qty);
        } else if ("STOCK_OUT".equals(type) || "REMOVE".equals(type)) {
            if (inventory.getAvailableQuantity() < qty) {
                throw new BadRequestException("Insufficient available stock in store to remove. Available: " + inventory.getAvailableQuantity());
            }
            inventory.setAvailableQuantity(inventory.getAvailableQuantity() - qty);
        } else {
            throw new BadRequestException("Invalid stock adjustment type. Use STOCK_IN or STOCK_OUT.");
        }

        Inventory saved = inventoryRepository.save(inventory);

        // Sync global product stock quantity
        product.setStockQuantity(saved.getAvailableQuantity());
        productRepository.save(product);

        // Log transaction
        InventoryTransaction tx = InventoryTransaction.builder()
                .inventory(saved)
                .quantity(qty)
                .type(type)
                .notes(request.getNotes() != null ? request.getNotes() : "Manual stock adjustment")
                .build();
        inventoryTransactionRepository.save(tx);

        if (saved.isLowStock()) {
            domainEventPublisher.publish(com.quickcart.event.InventoryEvents.LowStockDetectedEvent.builder()
                    .storeId(store.getId())
                    .productId(product.getId())
                    .productName(product.getName())
                    .currentStock(saved.getAvailableQuantity())
                    .reorderThreshold(saved.getLowStockThreshold())
                    .build());
        }

        log.info("Inventory adjusted for product {} at store {}: type={}, quantity={}", product.getId(), store.getId(), type, qty);
        return mapToDto(saved);
    }

    @Transactional
    public void reserveStockForOrder(Long storeId, Long productId, int quantity, String orderNumber) {
        Long targetStoreId = storeId;
        if (targetStoreId == null) {
            DarkStore defaultStore = darkStoreRepository.findByIsActiveTrue().stream().findFirst().orElse(null);
            if (defaultStore != null) targetStoreId = defaultStore.getId();
        }

        if (targetStoreId == null) return;
        final Long effectiveStoreId = targetStoreId;

        Inventory inventory = inventoryRepository.findByStoreIdAndProductIdWithLock(effectiveStoreId, productId)
                .orElseGet(() -> getOrCreateDefaultInventory(effectiveStoreId, productId));

        if (inventory.getAvailableQuantity() < quantity) {
            throw new BadRequestException("Product '" + inventory.getProduct().getName() + "' is out of stock or insufficient. Requested: " + quantity + ", Available: " + inventory.getAvailableQuantity());
        }

        inventory.setAvailableQuantity(inventory.getAvailableQuantity() - quantity);
        inventory.setReservedQuantity(inventory.getReservedQuantity() + quantity);
        Inventory saved = inventoryRepository.save(inventory);

        InventoryTransaction tx = InventoryTransaction.builder()
                .inventory(inventory)
                .quantity(quantity)
                .type("RESERVE")
                .referenceOrderNumber(orderNumber)
                .notes("Reserved for order " + orderNumber)
                .build();
        inventoryTransactionRepository.save(tx);

        if (saved.isLowStock()) {
            domainEventPublisher.publish(com.quickcart.event.InventoryEvents.LowStockDetectedEvent.builder()
                    .storeId(effectiveStoreId)
                    .productId(productId)
                    .productName(inventory.getProduct().getName())
                    .currentStock(saved.getAvailableQuantity())
                    .reorderThreshold(saved.getLowStockThreshold())
                    .build());
        }
    }

    @Transactional
    public void commitDeductionForOrder(Long storeId, Long productId, int quantity, String orderNumber) {
        if (storeId == null) {
            DarkStore defaultStore = darkStoreRepository.findByIsActiveTrue().stream().findFirst().orElse(null);
            if (defaultStore != null) storeId = defaultStore.getId();
        }
        if (storeId == null) return;

        Optional<Inventory> opt = inventoryRepository.findByStoreIdAndProductIdWithLock(storeId, productId);
        if (opt.isPresent()) {
            Inventory inventory = opt.get();
            int currentReserved = inventory.getReservedQuantity() != null ? inventory.getReservedQuantity() : 0;
            inventory.setReservedQuantity(Math.max(0, currentReserved - quantity));
            inventoryRepository.save(inventory);

            InventoryTransaction tx = InventoryTransaction.builder()
                    .inventory(inventory)
                    .quantity(quantity)
                    .type("SOLD")
                    .referenceOrderNumber(orderNumber)
                    .notes("Order fulfilled: " + orderNumber)
                    .build();
            inventoryTransactionRepository.save(tx);
        }
    }

    @Transactional
    public void releaseReservedStock(Long storeId, Long productId, int quantity, String orderNumber) {
        if (storeId == null) {
            DarkStore defaultStore = darkStoreRepository.findByIsActiveTrue().stream().findFirst().orElse(null);
            if (defaultStore != null) storeId = defaultStore.getId();
        }
        if (storeId == null) return;

        Optional<Inventory> opt = inventoryRepository.findByStoreIdAndProductIdWithLock(storeId, productId);
        if (opt.isPresent()) {
            Inventory inventory = opt.get();
            int currentReserved = inventory.getReservedQuantity() != null ? inventory.getReservedQuantity() : 0;
            int toRelease = Math.min(currentReserved, quantity);

            inventory.setReservedQuantity(currentReserved - toRelease);
            inventory.setAvailableQuantity(inventory.getAvailableQuantity() + quantity);
            inventoryRepository.save(inventory);

            InventoryTransaction tx = InventoryTransaction.builder()
                    .inventory(inventory)
                    .quantity(quantity)
                    .type("RELEASE")
                    .referenceOrderNumber(orderNumber)
                    .notes("Order cancelled, stock released: " + orderNumber)
                    .build();
            inventoryTransactionRepository.save(tx);
        }
    }

    private InventoryDto mapToDto(Inventory inv) {
        return InventoryDto.builder()
                .id(inv.getId())
                .storeId(inv.getStore().getId())
                .storeName(inv.getStore().getName())
                .storeCode(inv.getStore().getCode())
                .productId(inv.getProduct().getId())
                .productName(inv.getProduct().getName())
                .productSku(inv.getProduct().getSku())
                .availableQuantity(inv.getAvailableQuantity())
                .reservedQuantity(inv.getReservedQuantity())
                .totalQuantity(inv.getTotalQuantity())
                .lowStockThreshold(inv.getLowStockThreshold())
                .isLowStock(inv.isLowStock())
                .updatedAt(inv.getUpdatedAt())
                .build();
    }
}
