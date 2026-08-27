package com.quickcart.service.order;

import com.quickcart.dto.AddressDto;
import com.quickcart.dto.OrderItemResponse;
import com.quickcart.dto.OrderResponse;
import com.quickcart.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class OrderDtoMapperTest {

    private OrderDtoMapper mapper;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        mapper = new OrderDtoMapper();

        Address address = Address.builder()
                .id(1L)
                .label("Home")
                .receiverName("Alex Morgan")
                .receiverPhone("9876543210")
                .streetAddress("123 Main St")
                .city("Bengaluru")
                .state("Karnataka")
                .pincode("560034")
                .latitude(BigDecimal.valueOf(12.934))
                .longitude(BigDecimal.valueOf(77.620))
                .isDefault(true)
                .build();

        Product product = Product.builder()
                .id(10L)
                .name("Organic Milk")
                .imageUrl("https://images.unsplash.com/milk.jpg")
                .unitQuantity("1 L")
                .sellingPrice(BigDecimal.valueOf(60.0))
                .build();

        OrderItem item = new OrderItem(null, product, "Organic Milk", "https://images.unsplash.com/milk.jpg",
                "1 L", 2, BigDecimal.valueOf(60.0), BigDecimal.valueOf(120.0));

        Payment payment = Payment.builder()
                .id(99L)
                .transactionId("TXN-12345")
                .paymentMethod(PaymentMethod.UPI)
                .paymentStatus(PaymentStatus.COMPLETED)
                .amount(BigDecimal.valueOf(145.0))
                .currency("INR")
                .createdAt(LocalDateTime.now())
                .build();

        testOrder = Order.builder()
                .id(50L)
                .orderNumber("QC12345678")
                .status(OrderStatus.CONFIRMED)
                .itemTotal(BigDecimal.valueOf(120.0))
                .deliveryFee(BigDecimal.valueOf(25.0))
                .platformFee(BigDecimal.valueOf(5.0))
                .taxAmount(BigDecimal.valueOf(6.0))
                .discountAmount(BigDecimal.valueOf(10.0))
                .walletDiscountAmount(BigDecimal.ZERO)
                .tipAmount(BigDecimal.valueOf(10.0))
                .totalAmount(BigDecimal.valueOf(156.0))
                .couponCode("SAVE10")
                .deliveryInstructions("Leave at door")
                .estimatedDeliveryTime(LocalDateTime.now().plusMinutes(15))
                .address(address)
                .payment(payment)
                .items(List.of(item))
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should map complete Order entity to OrderResponse DTO")
    void shouldMapCompleteOrderToDto() {
        OrderResponse response = mapper.mapToDto(testOrder);

        assertNotNull(response);
        assertEquals("QC12345678", response.getOrderNumber());
        assertEquals(OrderStatus.CONFIRMED, response.getStatus());
        assertEquals(BigDecimal.valueOf(120.0), response.getItemTotal());
        assertEquals(BigDecimal.valueOf(156.0), response.getTotalAmount());
        assertEquals(1, response.getItems().size());
        assertEquals("Organic Milk", response.getItems().get(0).getProductName());
        assertNotNull(response.getAddress());
        assertEquals("Alex Morgan", response.getAddress().getReceiverName());
        assertEquals("TXN-12345", response.getTransactionId());
        assertEquals(PaymentStatus.COMPLETED, response.getPaymentStatus());
    }

    @Test
    @DisplayName("Should safely handle null values during mapping")
    void shouldHandleNullOrder() {
        assertNull(mapper.mapToDto(null));
        assertNull(mapper.mapItemToDto(null));
        assertNull(mapper.mapAddressToDto(null));
        assertNull(mapper.mapPaymentToDto(null));
    }
}
