package com.quickcart.controller;

import com.quickcart.dto.AddressDto;
import com.quickcart.dto.ApiResponse;
import com.quickcart.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@Tag(name = "Addresses", description = "Endpoints for managing saved user delivery addresses")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @Operation(summary = "Get all saved addresses for current user")
    public ResponseEntity<ApiResponse<List<AddressDto>>> getUserAddresses() {
        List<AddressDto> addresses = addressService.getUserAddresses();
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get address by ID")
    public ResponseEntity<ApiResponse<AddressDto>> getAddressById(@PathVariable Long id) {
        AddressDto address = addressService.getAddressById(id);
        return ResponseEntity.ok(ApiResponse.success(address));
    }

    @PostMapping
    @Operation(summary = "Add a new delivery address")
    public ResponseEntity<ApiResponse<AddressDto>> createAddress(@Valid @RequestBody AddressDto dto) {
        AddressDto created = addressService.createAddress(dto);
        return ResponseEntity.ok(ApiResponse.success("Address added successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing delivery address")
    public ResponseEntity<ApiResponse<AddressDto>> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressDto dto
    ) {
        AddressDto updated = addressService.updateAddress(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a saved delivery address")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }
}
