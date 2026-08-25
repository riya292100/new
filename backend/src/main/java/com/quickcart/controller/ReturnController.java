package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import com.quickcart.dto.CreateReturnRequestDto;
import com.quickcart.dto.ReturnRequestDto;
import com.quickcart.entity.ReturnRequest;
import com.quickcart.service.ReturnService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping({"/api/v1/returns", "/api/returns"})
@RequiredArgsConstructor
@Tag(name = "Returns & Refunds", description = "Endpoints for customer return requests, inspection tracking, and refund processing")
public class ReturnController {

    private final ReturnService returnService;

    @PostMapping
    @Operation(summary = "Submit a return request for a delivered order")
    public ResponseEntity<ApiResponse<ReturnRequestDto>> createReturn(@Valid @RequestBody CreateReturnRequestDto request) {
        ReturnRequestDto response = returnService.createReturnRequest(request);
        return ResponseEntity.ok(ApiResponse.success("Return request submitted successfully", response));
    }

    @GetMapping("/my-returns")
    @Operation(summary = "Get all return requests submitted by current user")
    public ResponseEntity<ApiResponse<List<ReturnRequestDto>>> getMyReturns() {
        List<ReturnRequestDto> returns = returnService.getUserReturns();
        return ResponseEntity.ok(ApiResponse.success(returns));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER') or hasRole('SUPPORT_AGENT')")
    @Operation(summary = "Get paginated return requests across all customers (Admin / Support)")
    public ResponseEntity<ApiResponse<Page<ReturnRequestDto>>> getAllReturnsAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ReturnRequestDto> response = returnService.getAllReturnsAdmin(page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER') or hasRole('SUPPORT_AGENT')")
    @Operation(summary = "Update return request inspection status and schedule pickup")
    public ResponseEntity<ApiResponse<ReturnRequestDto>> updateReturnStatus(
            @PathVariable Long id,
            @RequestParam ReturnRequest.ReturnStatus status,
            @RequestParam(required = false) String adminNotes,
            @RequestParam(required = false) String pickupScheduledTime
    ) {
        LocalDateTime pickupTime = null;
        if (pickupScheduledTime != null && !pickupScheduledTime.isBlank()) {
            try {
                pickupTime = LocalDateTime.parse(pickupScheduledTime);
            } catch (Exception _e) {
                // Ignore parse failure
            }
        }

        ReturnRequestDto updated = returnService.updateReturnStatus(id, status, adminNotes, pickupTime);
        return ResponseEntity.ok(ApiResponse.success("Return status updated successfully", updated));
    }
}
