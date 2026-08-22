package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import com.quickcart.dto.DeliveryLocationUpdateDto;
import com.quickcart.dto.OrderResponse;
import com.quickcart.dto.OrderStatusUpdateRequest;
import com.quickcart.entity.DeliveryPartner;
import com.quickcart.service.DeliveryPartnerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
@Tag(name = "Delivery Partner", description = "Endpoints for driver deliveries, status advances, and GPS simulation")
public class DeliveryPartnerController {

    private final DeliveryPartnerService deliveryPartnerService;

    @GetMapping("/profile")
    @Operation(summary = "Get delivery partner profile")
    public ResponseEntity<ApiResponse<DeliveryPartner>> getProfile() {
        DeliveryPartner partner = deliveryPartnerService.getCurrentPartner();
        return ResponseEntity.ok(ApiResponse.success(partner));
    }

    @GetMapping("/orders/assigned")
    @Operation(summary = "Get deliveries assigned to the current driver")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAssignedDeliveries() {
        List<OrderResponse> orders = deliveryPartnerService.getAssignedDeliveries();
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/orders/pending")
    @Operation(summary = "Get pending orders ready for pickup")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getPendingDeliveries() {
        List<OrderResponse> orders = deliveryPartnerService.getPendingDeliveries();
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PostMapping("/orders/{orderId}/accept")
    @Operation(summary = "Accept an assigned delivery")
    public ResponseEntity<ApiResponse<OrderResponse>> acceptDelivery(@PathVariable Long orderId) {
        OrderResponse order = deliveryPartnerService.acceptDelivery(orderId);
        return ResponseEntity.ok(ApiResponse.success("Delivery accepted", order));
    }

    @PostMapping("/orders/{orderId}/reject")
    @Operation(summary = "Reject an assigned delivery")
    public ResponseEntity<ApiResponse<OrderResponse>> rejectDelivery(@PathVariable Long orderId) {
        OrderResponse order = deliveryPartnerService.rejectDelivery(orderId);
        return ResponseEntity.ok(ApiResponse.success("Delivery rejected", order));
    }

    @PatchMapping("/orders/{orderId}/status")
    @Operation(summary = "Update order delivery status (e.g. OUT_FOR_DELIVERY, DELIVERED)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateDeliveryStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusUpdateRequest request
    ) {
        OrderResponse order = deliveryPartnerService.updateDeliveryStatus(orderId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Delivery status updated", order));
    }

    @PostMapping("/location")
    @Operation(summary = "Update driver live GPS latitude and longitude coordinates")
    public ResponseEntity<ApiResponse<Void>> updateLocation(@Valid @RequestBody DeliveryLocationUpdateDto dto) {
        deliveryPartnerService.updateLocation(dto);
        return ResponseEntity.ok(ApiResponse.success("Location updated", null));
    }
}
