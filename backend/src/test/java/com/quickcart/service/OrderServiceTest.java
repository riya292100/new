package com.quickcart.service;

import com.quickcart.dto.*;
import com.quickcart.entity.*;
import com.quickcart.event.DomainEventPublisher;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private AddressRepository addressRepository;
    @Mock private ProductRepository productRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private CouponRepository couponRepository;
    @Mock private CouponUsageRepository couponUsageRepository;
    @Mock private DeliveryPartnerRepository deliveryPartnerRepository;
    @Mock private DeliveryAssignmentRepository deliveryAssignmentRepository;
    @Mock private DarkStoreRepository darkStoreRepository;
    @Mock private CartService cartService;
    @Mock private CouponService couponService;
    @Mock private AuthService authService;
    @Mock private OrderTrackingWebSocketService webSocketService;
    @Mock private WalletService walletService;
    @Mock private InventoryService inventoryService;
    @Mock private NotificationService notificationService;
    @Mock private PaymentGatewayService paymentGatewayService;
    @Mock private PricingService pricingService;
    @Mock private StoreFulfillmentService storeFulfillmentService;
    @Mock private OrderStateHistoryRepository orderStateHistoryRepository;
    @Mock private DomainEventPublisher domainEventPublisher;
    @Mock private IdempotencyKeyRepository idempotencyKeyRepository;
    @org.mockito.Spy private com.quickcart.service.order.OrderDtoMapper orderDtoMapper = new com.quickcart.service.order.OrderDtoMapper();
    @Mock private com.quickcart.service.order.OrderLifecycleHandler orderLifecycleHandler;
    @Mock private com.quickcart.logging.StructuredAuditLogger auditLogger;

    @InjectMocks
    private OrderService orderService;

    private User testUser;
    private Address testAddress;
    private Product testProduct;
    private Cart testCart;
    private DarkStore testStore;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setFullName("Alex Vance");
        testUser.setEmail("alex@example.com");
        testUser.setRoles(Set.of(new Role(ERole.ROLE_CUSTOMER)));

        testAddress = new Address();
        testAddress.setId(10L);
        testAddress.setUser(testUser);
        testAddress.setStreetAddress("123 Main St");
        testAddress.setCity("New Delhi");
        testAddress.setLatitude(BigDecimal.valueOf(28.6139));
        testAddress.setLongitude(BigDecimal.valueOf(77.2090));

        testProduct = new Product();
        testProduct.setId(100L);
        testProduct.setName("Farm Fresh Milk");
        testProduct.setSellingPrice(BigDecimal.valueOf(30));
        testProduct.setMrp(BigDecimal.valueOf(35));
        testProduct.setStockQuantity(50);

        CartItem cartItem = new CartItem();
        cartItem.setId(5L);
        cartItem.setProduct(testProduct);
        cartItem.setQuantity(2);

        testCart = new Cart(testUser);
        testCart.setItems(new ArrayList<>(List.of(cartItem)));

        testStore = DarkStore.builder()
                .id(1L)
                .name("Connaught Place Hub")
                .code("HUB-DEL-01")
                .build();
    }

    @Test
    @DisplayName("createOrder - successfully places an order when cart and address are valid")
    void createOrder_Success() {
        when(authService.getCurrentUserEntity()).thenReturn(testUser);
        when(cartService.getOrCreateUserCart(testUser)).thenReturn(testCart);
        when(addressRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(testAddress));
        when(storeFulfillmentService.selectOptimalStore(any(), any(), anyList())).thenReturn(testStore);

        PricingCalculation pricing = PricingCalculation.builder()
                .itemSubtotal(BigDecimal.valueOf(60))
                .deliveryFee(BigDecimal.ZERO)
                .platformFee(BigDecimal.valueOf(5))
                .taxAmount(BigDecimal.valueOf(3))
                .couponDiscount(BigDecimal.ZERO)
                .walletDiscount(BigDecimal.ZERO)
                .finalPayableAmount(BigDecimal.valueOf(68))
                .build();
        when(pricingService.calculate(anyList(), any(), any())).thenReturn(pricing);

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(999L);
            o.setCreatedAt(LocalDateTime.now());
            return o;
        });

        CreateOrderRequest request = new CreateOrderRequest();
        request.setAddressId(10L);
        request.setPaymentMethod(PaymentMethod.UPI);

        OrderResponse response = orderService.createOrder(request);

        assertNotNull(response);
        assertEquals(OrderStatus.CONFIRMED, response.getStatus());
        assertEquals(BigDecimal.valueOf(68), response.getTotalAmount());
        verify(inventoryService).reserveStockForOrder(eq(1L), eq(100L), eq(2), anyString());
        verify(cartService).clearCart(testUser);
        verify(domainEventPublisher).publish(any());
        verify(webSocketService).broadcastOrderStatusUpdate(any());
    }

    @Test
    @DisplayName("createOrder - throws BadRequestException if cart is empty")
    void createOrder_EmptyCart_ThrowsBadRequest() {
        testCart.setItems(Collections.emptyList());
        when(authService.getCurrentUserEntity()).thenReturn(testUser);
        when(cartService.getOrCreateUserCart(testUser)).thenReturn(testCart);

        CreateOrderRequest request = new CreateOrderRequest();
        request.setAddressId(10L);

        assertThrows(BadRequestException.class, () -> orderService.createOrder(request));
    }

    @Test
    @DisplayName("createOrder - throws ResourceNotFoundException if address is not found")
    void createOrder_AddressNotFound_ThrowsResourceNotFound() {
        when(authService.getCurrentUserEntity()).thenReturn(testUser);
        when(cartService.getOrCreateUserCart(testUser)).thenReturn(testCart);
        when(addressRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        CreateOrderRequest request = new CreateOrderRequest();
        request.setAddressId(999L);

        assertThrows(ResourceNotFoundException.class, () -> orderService.createOrder(request));
    }

    @Test
    @DisplayName("cancelOrder - successfully cancels order and releases stock reservation")
    void cancelOrder_Success() {
        Order order = Order.builder()
                .id(101L)
                .orderNumber("QC101")
                .user(testUser)
                .status(OrderStatus.CONFIRMED)
                .store(testStore)
                .totalAmount(BigDecimal.valueOf(68))
                .walletDiscountAmount(BigDecimal.valueOf(10))
                .items(new ArrayList<>())
                .build();

        OrderItem item = new OrderItem(order, testProduct, "Milk", null, "1L", 2, BigDecimal.valueOf(30), BigDecimal.valueOf(60));
        order.getItems().add(item);

        when(authService.getCurrentUserEntity()).thenReturn(testUser);
        when(orderRepository.findById(101L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        OrderResponse response = orderService.cancelOrder(101L);

        assertNotNull(response);
        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        verify(orderLifecycleHandler).handleCancelled(eq(order));
    }

    @Test
    @DisplayName("cancelOrder - throws BadRequestException if order is already out for delivery")
    void cancelOrder_OutForDelivery_ThrowsBadRequest() {
        Order order = Order.builder()
                .id(102L)
                .orderNumber("QC102")
                .user(testUser)
                .status(OrderStatus.OUT_FOR_DELIVERY)
                .build();

        when(authService.getCurrentUserEntity()).thenReturn(testUser);
        when(orderRepository.findById(102L)).thenReturn(Optional.of(order));

        assertThrows(BadRequestException.class, () -> orderService.cancelOrder(102L));
    }

    @Test
    @DisplayName("updateOrderStatus - delivered status delegates to lifecycle handler")
    void updateOrderStatus_Delivered_Success() {
        Order order = Order.builder()
                .id(103L)
                .orderNumber("QC103")
                .user(testUser)
                .status(OrderStatus.OUT_FOR_DELIVERY)
                .store(testStore)
                .items(new ArrayList<>())
                .build();

        OrderItem item = new OrderItem(order, testProduct, "Milk", null, "1L", 2, BigDecimal.valueOf(30), BigDecimal.valueOf(60));
        order.getItems().add(item);

        when(orderRepository.findById(103L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        OrderResponse response = orderService.updateOrderStatus(103L, OrderStatus.DELIVERED);

        assertNotNull(response);
        assertEquals(OrderStatus.DELIVERED, order.getStatus());
        verify(orderLifecycleHandler).handleDelivered(eq(order));
    }

    @Test
    @DisplayName("getOrderById - throws BadRequestException when unauthorized user attempts access")
    void getOrderById_Unauthorized_ThrowsBadRequest() {
        User otherUser = new User();
        otherUser.setId(99L);
        otherUser.setEmail("other@example.com");
        otherUser.setRoles(Set.of(new Role(ERole.ROLE_CUSTOMER)));

        Order order = Order.builder()
                .id(200L)
                .user(otherUser)
                .status(OrderStatus.CONFIRMED)
                .build();

        when(authService.getCurrentUserEntity()).thenReturn(testUser);
        when(orderRepository.findById(200L)).thenReturn(Optional.of(order));

        assertThrows(BadRequestException.class, () -> orderService.getOrderById(200L));
    }
}
