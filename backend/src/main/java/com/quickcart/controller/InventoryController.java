package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import com.quickcart.dto.InventoryDto;
import com.quickcart.dto.InventoryStockAdjustmentRequest;
import com.quickcart.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/inventory", "/api/inventory"})
@RequiredArgsConstructor
@Tag(name = "Inventory Management", description = "APIs for multi-store inventory, stock adjustments, and low-stock alerts")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER')")
    @Operation(summary = "Get all inventory items for a store")
    public ResponseEntity<List<InventoryDto>> getStoreInventory(@PathVariable Long storeId) {
        return ResponseEntity.ok(inventoryService.getInventoriesByStore(storeId));
    }

    @GetMapping("/store/{storeId}/product/{productId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER')")
    @Operation(summary = "Get inventory item for a specific product at a store")
    public ResponseEntity<InventoryDto> getInventoryItem(
            @PathVariable Long storeId,
            @PathVariable Long productId
    ) {
        return ResponseEntity.ok(inventoryService.getInventoryByStoreAndProduct(storeId, productId));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER')")
    @Operation(summary = "Get all low-stock inventory alerts")
    public ResponseEntity<List<InventoryDto>> getLowStockAlerts(
            @RequestParam(required = false) Long storeId
    ) {
        return ResponseEntity.ok(inventoryService.getLowStockAlerts(storeId));
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER')")
    @Operation(summary = "Perform stock-in or stock-out adjustment (Admin / Store Manager)")
    public ResponseEntity<InventoryDto> adjustStock(@Valid @RequestBody InventoryStockAdjustmentRequest request) {
        return ResponseEntity.ok(inventoryService.adjustStock(request));
    }
}
