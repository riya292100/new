package com.quickcart.controller;

import com.quickcart.dto.*;
import com.quickcart.entity.DeliveryPartner;
import com.quickcart.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/admin", "/api/admin"})
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Endpoints for platform management, analytics, inventory, and order dispatch")
public class AdminController {

    private final AdminService adminService;
    private final ProductService productService;
    private final CategoryService categoryService;
    private final OrderService orderService;
    private final CouponService couponService;
    private final DeliveryPartnerService deliveryPartnerService;
    private final FinancialLedgerService financialLedgerService;
    private final com.quickcart.repository.DarkStoreRepository darkStoreRepository;

    // Financial Ledger Audit Stream
    @GetMapping("/financial-ledger")
    @Operation(summary = "Get paginated double-entry financial ledger movements")
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<FinancialLedgerDto>>> getFinancialLedger(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        org.springframework.data.domain.Page<FinancialLedgerDto> entries = financialLedgerService.getLedgerEntriesPaged(page, size);
        return ResponseEntity.ok(ApiResponse.success(entries));
    }

    @GetMapping("/stores")
    @Operation(summary = "Get all dark store fulfillment hubs")
    public ResponseEntity<ApiResponse<List<com.quickcart.entity.DarkStore>>> getAllStores() {
        List<com.quickcart.entity.DarkStore> stores = darkStoreRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(stores));
    }

    // Analytics Dashboard
    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get overall KPI statistics, charts data, and low-stock alerts")
    public ResponseEntity<ApiResponse<AdminDashboardStatsDto>> getDashboardStats() {
        AdminDashboardStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // Product CRUD
    @PostMapping("/products")
    @Operation(summary = "Create a new product")
    public ResponseEntity<ApiResponse<ProductResponseDto>> createProduct(@Valid @RequestBody ProductRequestDto dto) {
        ProductResponseDto created = productService.createProduct(dto);
        return ResponseEntity.ok(ApiResponse.success("Product created successfully", created));
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Update an existing product")
    public ResponseEntity<ApiResponse<ProductResponseDto>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDto dto
    ) {
        ProductResponseDto updated = productService.updateProduct(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updated));
    }

    @PatchMapping("/products/{id}/stock")
    @Operation(summary = "Update stock quantity for a product")
    public ResponseEntity<ApiResponse<Void>> updateProductStock(
            @PathVariable Long id,
            @RequestParam int stock
    ) {
        productService.updateStock(id, stock);
        return ResponseEntity.ok(ApiResponse.success("Stock updated", null));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Delete a product")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    // Category CRUD
    @GetMapping("/inventory/low-stock")
    @Operation(summary = "Get all products with stock below their low-stock threshold")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getLowStockProducts() {
        List<ProductResponseDto> lowStock = productService.getLowStockProducts();
        return ResponseEntity.ok(ApiResponse.success(lowStock));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all categories (including inactive)")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategoriesAdmin() {
        List<CategoryDto> categories = categoryService.getAllCategoriesAdmin();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping("/categories")
    @Operation(summary = "Create a new grocery category")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CategoryDto dto) {
        CategoryDto created = categoryService.createCategory(dto);
        return ResponseEntity.ok(ApiResponse.success("Category created successfully", created));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update a category")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryDto dto
    ) {
        CategoryDto updated = categoryService.updateCategory(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", updated));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Delete a category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }

    // Order Management & Dispatch
    @GetMapping("/orders")
    @Operation(summary = "Get all orders with real-time status")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrdersAdmin();
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PostMapping("/orders/assign-partner")
    @Operation(summary = "Manually assign a delivery partner to an order")
    public ResponseEntity<ApiResponse<OrderResponse>> assignPartner(
            @Valid @RequestBody DeliveryPartnerAssignmentRequest request
    ) {
        OrderResponse order = adminService.assignDeliveryPartner(request);
        return ResponseEntity.ok(ApiResponse.success("Delivery partner assigned", order));
    }

    // Coupons
    @GetMapping("/coupons")
    @Operation(summary = "Get all coupons")
    public ResponseEntity<ApiResponse<List<CouponDto>>> getAllCoupons() {
        List<CouponDto> coupons = couponService.getAllCouponsAdmin();
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }

    @PostMapping("/coupons")
    @Operation(summary = "Create a new discount coupon")
    public ResponseEntity<ApiResponse<CouponDto>> createCoupon(@Valid @RequestBody CouponDto dto) {
        CouponDto created = couponService.createCoupon(dto);
        return ResponseEntity.ok(ApiResponse.success("Coupon created successfully", created));
    }

    @DeleteMapping("/coupons/{id}")
    @Operation(summary = "Delete a coupon")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted", null));
    }

    // Users & Delivery Partners
    @GetMapping("/users")
    @Operation(summary = "Get all registered users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PatchMapping("/users/{id}/toggle-status")
    @Operation(summary = "Toggle user active/inactive status")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable Long id) {
        adminService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("User status toggled", null));
    }

    @GetMapping("/delivery-partners")
    @Operation(summary = "Get all delivery partner profiles")
    public ResponseEntity<ApiResponse<List<DeliveryPartner>>> getAllDeliveryPartners() {
        List<DeliveryPartner> partners = deliveryPartnerService.getAllDeliveryPartners();
        return ResponseEntity.ok(ApiResponse.success(partners));
    }
}
