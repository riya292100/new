package com.quickcart.service;

import com.quickcart.dto.AddToCartRequest;
import com.quickcart.dto.CartResponse;
import com.quickcart.entity.Cart;
import com.quickcart.entity.CartItem;
import com.quickcart.entity.Category;
import com.quickcart.entity.Product;
import com.quickcart.entity.User;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.CartItemRepository;
import com.quickcart.repository.CartRepository;
import com.quickcart.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private CartService cartService;

    private User mockUser;
    private Cart mockCart;
    private Product mockProduct;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(cartService, "freeDeliveryThreshold", 199.0);
        ReflectionTestUtils.setField(cartService, "baseDeliveryFee", 25.0);
        ReflectionTestUtils.setField(cartService, "platformFee", 5.0);
        ReflectionTestUtils.setField(cartService, "taxRate", 0.05);

        mockUser = new User("Customer", "customer@quickcart.com", "9876543210", "pass");
        mockUser.setId(1L);

        mockCart = new Cart(mockUser);
        mockCart.setId(10L);
        mockCart.setItems(new ArrayList<>());

        Category category = new Category();
        category.setName("Snacks");

        mockProduct = new Product();
        mockProduct.setId(100L);
        mockProduct.setName("Potato Chips");
        mockProduct.setCategory(category);
        mockProduct.setSellingPrice(BigDecimal.valueOf(50));
        mockProduct.setMrp(BigDecimal.valueOf(60));
        mockProduct.setStockQuantity(20);
        mockProduct.setIsActive(true);
    }

    @Test
    void testAddToCart_NewItem_Success() {
        when(authService.getCurrentAuthenticatedUser()).thenReturn(mockUser);
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(mockCart));
        when(productRepository.findById(100L)).thenReturn(Optional.of(mockProduct));
        when(cartItemRepository.findByCartIdAndProductId(10L, 100L)).thenReturn(Optional.empty());

        AddToCartRequest request = new AddToCartRequest(100L, 2);
        CartResponse response = cartService.addToCart(request);

        assertNotNull(response);
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

    @Test
    void testAddToCart_ProductNotFound() {
        when(authService.getCurrentAuthenticatedUser()).thenReturn(mockUser);
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(mockCart));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        AddToCartRequest request = new AddToCartRequest(999L, 1);
        assertThrows(ResourceNotFoundException.class, () -> cartService.addToCart(request));
    }

    @Test
    void testAddToCart_ExceedsStock() {
        when(authService.getCurrentAuthenticatedUser()).thenReturn(mockUser);
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(mockCart));
        when(productRepository.findById(100L)).thenReturn(Optional.of(mockProduct));

        AddToCartRequest request = new AddToCartRequest(100L, 50); // only 20 in stock
        assertThrows(BadRequestException.class, () -> cartService.addToCart(request));
    }
}
