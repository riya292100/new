package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import com.quickcart.entity.DarkStore;
import com.quickcart.repository.DarkStoreRepository;
import com.quickcart.service.StoreFulfillmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping({"/api/v1/dark-stores", "/api/dark-stores"})
@RequiredArgsConstructor
@Tag(name = "Dark Stores", description = "Endpoints for dark store fulfillment hubs and geo-allocation")
public class DarkStoreController {

    private final DarkStoreRepository darkStoreRepository;
    private final StoreFulfillmentService storeFulfillmentService;

    @GetMapping
    @Operation(summary = "Get all active dark store fulfillment hubs")
    public ResponseEntity<ApiResponse<List<DarkStore>>> getActiveStores() {
        List<DarkStore> stores = darkStoreRepository.findByIsActiveTrue();
        return ResponseEntity.ok(ApiResponse.success(stores));
    }

    @GetMapping("/nearest")
    @Operation(summary = "Find nearest dark store for given latitude and longitude")
    public ResponseEntity<ApiResponse<DarkStore>> getNearestStore(
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude
    ) {
        DarkStore store = storeFulfillmentService.selectOptimalStore(latitude, longitude, Collections.emptyList());
        return ResponseEntity.ok(ApiResponse.success(store));
    }
}
