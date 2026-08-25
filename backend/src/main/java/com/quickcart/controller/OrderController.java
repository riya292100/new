package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import com.quickcart.dto.CreateOrderRequest;
import com.quickcart.dto.OrderResponse;
import com.quickcart.dto.OrderStatusUpdateRequest;
import com.quickcart.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/orders", "/api/orders"})
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Endpoints for order creation, tracking, and cancellation")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create and place a new order from active cart")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse order = orderService.createOrder(request);
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully", order));
    }

    @GetMapping
    @Operation(summary = "Get all orders placed by the current user")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getUserOrders() {
        List<OrderResponse> orders = orderService.getUserOrders();
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/paged")
    @Operation(summary = "Get paginated orders for current user")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getUserOrdersPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<OrderResponse> orders = orderService.getUserOrdersPaged(page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single order details by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @GetMapping("/track/{orderNumber}")
    @Operation(summary = "Get live order tracking details by order number")
    public ResponseEntity<ApiResponse<OrderResponse>> trackOrder(@PathVariable String orderNumber) {
        OrderResponse order = orderService.getOrderByOrderNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @GetMapping("/{id}/timeline")
    @Operation(summary = "Get immutable order state transition audit timeline")
    public ResponseEntity<ApiResponse<List<com.quickcart.dto.OrderStateHistoryDto>>> getOrderTimeline(@PathVariable Long id) {
        List<com.quickcart.dto.OrderStateHistoryDto> timeline = orderService.getOrderTimeline(id);
        return ResponseEntity.ok(ApiResponse.success(timeline));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order before dispatch")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable Long id) {
        OrderResponse order = orderService.cancelOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status (Admin/Staff)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request
    ) {
        OrderResponse order = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Order status updated", order));
    }

    @GetMapping(value = "/{id}/live-stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Subscribe to live Server-Sent Events stream for order tracking")
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamOrderUpdates(
            @PathVariable Long id,
            @org.springframework.beans.factory.annotation.Autowired com.quickcart.service.OrderTrackingSseService sseService) {
        return sseService.subscribeToOrderUpdates(id);
    }
}

