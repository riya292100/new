package com.quickcart.service;

import com.quickcart.dto.CategoryDto;
import com.quickcart.entity.Category;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.CategoryRepository;
import com.quickcart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public List<CategoryDto> getAllActiveCategories() {
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<CategoryDto> getAllCategoriesAdmin() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToDto(category);
    }

    public CategoryDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
        return mapToDto(category);
    }

    @Transactional
    public CategoryDto createCategory(CategoryDto dto) {
        String slug = dto.getSlug() != null && !dto.getSlug().isBlank()
                ? dto.getSlug().trim().toLowerCase()
                : dto.getName().trim().toLowerCase().replaceAll("[^a-z0-9]+", "-");

        if (categoryRepository.existsBySlug(slug)) {
            throw new BadRequestException("Category with slug '" + slug + "' already exists.");
        }

        Category category = new Category();
        category.setName(dto.getName().trim());
        category.setSlug(slug);
        category.setDescription(dto.getDescription());
        category.setIconName(dto.getIconName());
        category.setImageUrl(dto.getImageUrl());
        category.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        category.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        return mapToDto(categoryRepository.save(category));
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        category.setName(dto.getName().trim());
        if (dto.getSlug() != null && !dto.getSlug().isBlank()) {
            category.setSlug(dto.getSlug().trim().toLowerCase());
        }
        category.setDescription(dto.getDescription());
        category.setIconName(dto.getIconName());
        category.setImageUrl(dto.getImageUrl());
        if (dto.getDisplayOrder() != null) {
            category.setDisplayOrder(dto.getDisplayOrder());
        }
        if (dto.getIsActive() != null) {
            category.setIsActive(dto.getIsActive());
        }

        return mapToDto(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private CategoryDto mapToDto(Category category) {
        long count = productRepository.findByCategoryIdAndIsActiveTrue(category.getId()).size();
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getIconName(),
                category.getImageUrl(),
                category.getDisplayOrder(),
                category.getIsActive(),
                count
        );
    }
}
