package com.quickcart.service;

import com.quickcart.dto.InventoryDto;
import com.quickcart.dto.InventoryStockAdjustmentRequest;
import com.quickcart.entity.DarkStore;
import com.quickcart.entity.Inventory;
import com.quickcart.entity.InventoryTransaction;
import com.quickcart.entity.Product;
import com.quickcart.exception.BadRequestException;
import com.quickcart.repository.DarkStoreRepository;
import com.quickcart.repository.InventoryRepository;
import com.quickcart.repository.InventoryTransactionRepository;
import com.quickcart.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Mock
    private DarkStoreRepository darkStoreRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private DarkStore testStore;
    private Product testProduct;
    private Inventory testInventory;

    @BeforeEach
    void setUp() {
        testStore = DarkStore.builder()
                .id(1L)
                .name("Koramangala Dark Store")
                .code("HUB-BLR-01")
                .address("123 80 Feet Rd")
                .city("Bengaluru")
                .latitude(BigDecimal.valueOf(12.9352))
                .longitude(BigDecimal.valueOf(77.6245))
                .radiusKm(BigDecimal.valueOf(8.0))
                .isActive(true)
                .build();

        testProduct = Product.builder()
                .id(10L)
                .name("Farm Fresh Milk 1L")
                .slug("farm-fresh-milk-1l")
                .brand("Amul")
                .mrp(BigDecimal.valueOf(65.0))
                .sellingPrice(BigDecimal.valueOf(60.0))
                .unitQuantity("1 L")
                .stockQuantity(50)
                .lowStockThreshold(10)
                .imageUrl("https://images.unsplash.com/photo-test.jpg")
                .isActive(true)
                .build();

        testInventory = Inventory.builder()
                .id(100L)
                .store(testStore)
                .product(testProduct)
                .availableQuantity(50)
                .reservedQuantity(0)
                .lowStockThreshold(10)
                .version(1L)
                .build();
    }

    @Test
    @DisplayName("Should successfully adjust stock in (STOCK_IN)")
    void shouldAdjustStockIn() {
        InventoryStockAdjustmentRequest request = InventoryStockAdjustmentRequest.builder()
                .storeId(1L)
                .productId(10L)
                .quantity(20)
                .type("STOCK_IN")
                .notes("Fresh stock delivery")
                .build();

        when(darkStoreRepository.findById(1L)).thenReturn(Optional.of(testStore));
        when(productRepository.findById(10L)).thenReturn(Optional.of(testProduct));
        when(inventoryRepository.findByStoreIdAndProductIdWithLock(1L, 10L)).thenReturn(Optional.of(testInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(i -> i.getArgument(0));

        InventoryDto result = inventoryService.adjustStock(request);

        assertNotNull(result);
        assertEquals(70, result.getAvailableQuantity());
        verify(inventoryTransactionRepository, times(1)).save(any(InventoryTransaction.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException on stock-out when insufficient stock")
    void shouldThrowWhenInsufficientStockOut() {
        InventoryStockAdjustmentRequest request = InventoryStockAdjustmentRequest.builder()
                .storeId(1L)
                .productId(10L)
                .quantity(100)
                .type("STOCK_OUT")
                .build();

        when(darkStoreRepository.findById(1L)).thenReturn(Optional.of(testStore));
        when(productRepository.findById(10L)).thenReturn(Optional.of(testProduct));
        when(inventoryRepository.findByStoreIdAndProductIdWithLock(1L, 10L)).thenReturn(Optional.of(testInventory));

        assertThrows(BadRequestException.class, () -> inventoryService.adjustStock(request));
    }

    @Test
    @DisplayName("Should reserve stock atomically for order")
    void shouldReserveStockForOrder() {
        when(inventoryRepository.findByStoreIdAndProductIdWithLock(1L, 10L)).thenReturn(Optional.of(testInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(i -> i.getArgument(0));

        inventoryService.reserveStockForOrder(1L, 10L, 5, "QC123456");

        assertEquals(45, testInventory.getAvailableQuantity());
        assertEquals(5, testInventory.getReservedQuantity());
        verify(inventoryTransactionRepository, times(1)).save(any(InventoryTransaction.class));
    }

    @Test
    @DisplayName("Should release reserved stock on order cancellation")
    void shouldReleaseReservedStock() {
        testInventory.setAvailableQuantity(45);
        testInventory.setReservedQuantity(5);

        when(inventoryRepository.findByStoreIdAndProductIdWithLock(1L, 10L)).thenReturn(Optional.of(testInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(i -> i.getArgument(0));

        inventoryService.releaseReservedStock(1L, 10L, 5, "QC123456");

        assertEquals(50, testInventory.getAvailableQuantity());
        assertEquals(0, testInventory.getReservedQuantity());
    }
}
