package com.quickcart.service;

import com.quickcart.dto.ProductResponseDto;
import com.quickcart.entity.Category;
import com.quickcart.entity.Product;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.CategoryRepository;
import com.quickcart.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct;
    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleCategory = new Category();
        sampleCategory.setId(1L);
        sampleCategory.setName("Fruits & Vegetables");
        sampleCategory.setSlug("fruits-vegetables");

        sampleProduct = new Product();
        sampleProduct.setId(10L);
        sampleProduct.setName("Fresh Strawberries");
        sampleProduct.setCategory(sampleCategory);
        sampleProduct.setSellingPrice(BigDecimal.valueOf(120));
        sampleProduct.setMrp(BigDecimal.valueOf(150));
        sampleProduct.setStockQuantity(30);
        sampleProduct.setLowStockThreshold(10);
        sampleProduct.setIsActive(true);
        sampleProduct.setIsFeatured(true);
        sampleProduct.setIsDailyDeal(true);
    }

    @Test
    void testGetProductById_Success() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));

        ProductResponseDto dto = productService.getProductById(10L);

        assertNotNull(dto);
        assertEquals("Fresh Strawberries", dto.getName());
        assertEquals(BigDecimal.valueOf(120), dto.getSellingPrice());
    }

    @Test
    void testGetProductById_NotFound() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(999L));
    }

    @Test
    void testGetFeaturedProducts() {
        when(productRepository.findByIsFeaturedTrueAndIsActiveTrue())
                .thenReturn(Arrays.asList(sampleProduct));

        List<ProductResponseDto> featured = productService.getFeaturedProducts();

        assertNotNull(featured);
        assertEquals(1, featured.size());
        assertEquals("Fresh Strawberries", featured.get(0).getName());
    }

    @Test
    void testGetDailyDeals() {
        when(productRepository.findByIsDailyDealTrueAndIsActiveTrue())
                .thenReturn(Arrays.asList(sampleProduct));

        List<ProductResponseDto> deals = productService.getDailyDeals();

        assertNotNull(deals);
        assertEquals(1, deals.size());
        assertTrue(deals.get(0).getIsDailyDeal());
    }
}
