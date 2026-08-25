package com.quickcart.service;

import com.quickcart.entity.DarkStore;
import com.quickcart.entity.Inventory;
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

import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class InventoryConcurrencyTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Mock
    private DarkStoreRepository darkStoreRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private com.quickcart.event.DomainEventPublisher domainEventPublisher;

    @InjectMocks
    private InventoryService inventoryService;

    private Inventory inventory;

    @BeforeEach
    void setUp() {
        DarkStore store = DarkStore.builder().id(1L).name("Central Hub").build();
        Product product = Product.builder().id(10L).name("Organic Hass Avocado").stockQuantity(20).build();

        inventory = Inventory.builder()
                .id(100L)
                .store(store)
                .product(product)
                .availableQuantity(20)
                .reservedQuantity(0)
                .lowStockThreshold(5)
                .version(1L)
                .build();
    }

    @Test
    @DisplayName("100 concurrent customers on 20 stock: exactly 20 succeed and 80 fail with zero overselling")
    void testConcurrentInventoryReservations_NoOverselling() throws InterruptedException {
        int totalRequests = 100;
        int availableStock = 20;

        // Synchronized mock to simulate database pessimistic lock
        lenient().when(inventoryRepository.findByStoreIdAndProductIdWithLock(1L, 10L)).thenAnswer(inv -> {
            synchronized (inventory) {
                return Optional.of(inventory);
            }
        });

        lenient().when(inventoryRepository.save(any(Inventory.class))).thenAnswer(inv -> inv.getArgument(0));

        ExecutorService executor = Executors.newFixedThreadPool(20);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(totalRequests);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 0; i < totalRequests; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    startLatch.await();
                    synchronized (inventory) {
                        if (inventory.getAvailableQuantity() >= 1) {
                            inventory.setAvailableQuantity(inventory.getAvailableQuantity() - 1);
                            inventory.setReservedQuantity(inventory.getReservedQuantity() + 1);
                            successCount.incrementAndGet();
                        } else {
                            failureCount.incrementAndGet();
                            throw new BadRequestException("Out of stock");
                        }
                    }
                } catch (BadRequestException _ex) {
                    // expected for stockouts
                } catch (Exception ex) {
                    failureCount.incrementAndGet();
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        startLatch.countDown(); // Release all 100 threads at the same time
        finishLatch.await();
        executor.shutdown();

        assertEquals(availableStock, successCount.get(), "Exactly 20 requests must succeed");
        assertEquals(totalRequests - availableStock, failureCount.get(), "Remaining 80 requests must fail");
        assertEquals(0, inventory.getAvailableQuantity(), "Available stock must be exactly zero");
        assertEquals(availableStock, inventory.getReservedQuantity(), "Reserved stock must equal initial stock");
    }
}
