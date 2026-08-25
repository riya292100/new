package com.quickcart.service;

import com.quickcart.dto.BrandDto;
import com.quickcart.entity.Brand;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;

    @Cacheable(value = "brands", unless = "#result.isEmpty()")
    public List<BrandDto> getAllBrands() {
        return brandRepository.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public BrandDto getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
        return mapToDto(brand);
    }

    public BrandDto getBrandBySlug(String slug) {
        Brand brand = brandRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with slug: " + slug));
        return mapToDto(brand);
    }

    @Transactional
    @CacheEvict(value = {"brands", "products"}, allEntries = true)
    public BrandDto createBrand(BrandDto dto) {
        String slug = dto.getSlug() != null && !dto.getSlug().isBlank()
                ? dto.getSlug().trim().toLowerCase().replaceAll("[^a-z0-9]+", "-")
                : dto.getName().trim().toLowerCase().replaceAll("[^a-z0-9]+", "-");

        if (brandRepository.findBySlug(slug).isPresent()) {
            throw new BadRequestException("Brand with slug '" + slug + "' already exists");
        }

        Brand brand = Brand.builder()
                .name(dto.getName().trim())
                .slug(slug)
                .logoUrl(dto.getLogoUrl())
                .description(dto.getDescription())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        return mapToDto(brandRepository.save(brand));
    }

    @Transactional
    @CacheEvict(value = {"brands", "products"}, allEntries = true)
    public BrandDto updateBrand(Long id, BrandDto dto) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));

        brand.setName(dto.getName().trim());
        if (dto.getLogoUrl() != null) brand.setLogoUrl(dto.getLogoUrl());
        if (dto.getDescription() != null) brand.setDescription(dto.getDescription());
        if (dto.getIsActive() != null) brand.setIsActive(dto.getIsActive());

        return mapToDto(brandRepository.save(brand));
    }

    @Transactional
    @CacheEvict(value = {"brands", "products"}, allEntries = true)
    public void deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
        brand.setIsActive(false);
        brandRepository.save(brand);
    }

    private BrandDto mapToDto(Brand b) {
        return BrandDto.builder()
                .id(b.getId())
                .name(b.getName())
                .slug(b.getSlug())
                .logoUrl(b.getLogoUrl())
                .description(b.getDescription())
                .isActive(b.getIsActive())
                .build();
    }
}
