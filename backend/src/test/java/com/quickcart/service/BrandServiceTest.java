package com.quickcart.service;

import com.quickcart.dto.BrandDto;
import com.quickcart.entity.Brand;
import com.quickcart.repository.BrandRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BrandServiceTest {

    @Mock
    private BrandRepository brandRepository;

    @InjectMocks
    private BrandService brandService;

    private Brand testBrand;

    @BeforeEach
    void setUp() {
        testBrand = Brand.builder()
                .id(1L)
                .name("Organic India")
                .slug("organic-india")
                .logoUrl("https://images.unsplash.com/brand.jpg")
                .description("Pure organic tea and infusions")
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Should return all active brands")
    void shouldReturnAllActiveBrands() {
        when(brandRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of(testBrand));

        List<BrandDto> brands = brandService.getAllBrands();

        assertNotNull(brands);
        assertEquals(1, brands.size());
        assertEquals("Organic India", brands.get(0).getName());
    }

    @Test
    @DisplayName("Should create brand with auto-generated slug")
    void shouldCreateBrand() {
        BrandDto dto = BrandDto.builder()
                .name("Tata Tea")
                .description("Premium Indian teas")
                .build();

        when(brandRepository.findBySlug("tata-tea")).thenReturn(Optional.empty());
        when(brandRepository.save(any(Brand.class))).thenAnswer(i -> {
            Brand b = i.getArgument(0);
            b.setId(2L);
            return b;
        });

        BrandDto result = brandService.createBrand(dto);

        assertNotNull(result);
        assertEquals("Tata Tea", result.getName());
        assertEquals("tata-tea", result.getSlug());
    }
}
