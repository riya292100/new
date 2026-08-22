package com.quickcart.service;

import com.quickcart.dto.ProductRequestDto;
import com.quickcart.dto.ProductResponseDto;
import com.quickcart.entity.Category;
import com.quickcart.entity.Product;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.CategoryRepository;
import com.quickcart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public Page<ProductResponseDto> getAllProducts(
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String brand,
            String sortBy,
            String sortDirection,
            int page,
            int size
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection != null ? sortDirection : "ASC"),
                sortBy != null && !sortBy.isBlank() ? sortBy : "id");
        Pageable pageable = PageRequest.of(page, size, sort);

        return productRepository.filterProducts(categoryId, minPrice, maxPrice, brand, pageable)
                .map(this::mapToDto);
    }

    public List<ProductResponseDto> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDto> getDailyDeals() {
        return productRepository.findByIsDailyDealTrueAndIsActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDto> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ProductResponseDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToDto(product);
    }

    public ProductResponseDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));
        return mapToDto(product);
    }

    public List<ProductResponseDto> searchProducts(String query) {
        if (query == null || query.trim().isBlank()) {
            return List.of();
        }
        return productRepository.searchProducts(query.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDto> getSearchSuggestions(String query, int limit) {
        if (query == null || query.trim().isBlank()) {
            return List.of();
        }
        Pageable pageable = PageRequest.of(0, limit);
        return productRepository.searchSuggestions(query.trim(), pageable).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDto> getRelatedProducts(Long productId, int limit) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        Pageable pageable = PageRequest.of(0, limit);
        return productRepository.findRelatedProducts(product.getCategory().getId(), productId, pageable).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDto> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponseDto createProduct(ProductRequestDto dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        String slug = dto.getSlug() != null && !dto.getSlug().isBlank()
                ? dto.getSlug().trim().toLowerCase()
                : generateSlug(dto.getName());

        if (productRepository.findBySlug(slug).isPresent()) {
            slug = slug + "-" + System.currentTimeMillis() % 10000;
        }

        Product product = new Product();
        product.setCategory(category);
        product.setName(dto.getName().trim());
        product.setSlug(slug);
        product.setBrand(dto.getBrand().trim());
        product.setDescription(dto.getDescription());
        product.setMrp(dto.getMrp());
        product.setSellingPrice(dto.getSellingPrice());

        // Calculate discount percentage automatically if not provided
        if (dto.getDiscountPercentage() != null) {
            product.setDiscountPercentage(dto.getDiscountPercentage());
        } else if (dto.getMrp().compareTo(dto.getSellingPrice()) > 0) {
            BigDecimal diff = dto.getMrp().subtract(dto.getSellingPrice());
            int discount = diff.multiply(BigDecimal.valueOf(100)).divide(dto.getMrp(), RoundingMode.HALF_UP).intValue();
            product.setDiscountPercentage(discount);
        } else {
            product.setDiscountPercentage(0);
        }

        product.setUnitQuantity(dto.getUnitQuantity().trim());
        product.setStockQuantity(dto.getStockQuantity());
        product.setLowStockThreshold(dto.getLowStockThreshold() != null ? dto.getLowStockThreshold() : 10);
        product.setSku(dto.getSku() != null && !dto.getSku().isBlank() ? dto.getSku() : "QC-" + System.currentTimeMillis() % 100000);
        product.setImageUrl(dto.getImageUrl().trim());
        product.setRating(dto.getRating() != null ? dto.getRating() : BigDecimal.valueOf(4.5));
        product.setRatingCount(dto.getRatingCount() != null ? dto.getRatingCount() : 12);
        product.setIsFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false);
        product.setIsDailyDeal(dto.getIsDailyDeal() != null ? dto.getIsDailyDeal() : false);
        product.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        return mapToDto(productRepository.save(product));
    }

    @Transactional
    public ProductResponseDto updateProduct(Long id, ProductRequestDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));
            product.setCategory(category);
        }

        product.setName(dto.getName().trim());
        if (dto.getSlug() != null && !dto.getSlug().isBlank()) {
            product.setSlug(dto.getSlug().trim().toLowerCase());
        }
        product.setBrand(dto.getBrand().trim());
        product.setDescription(dto.getDescription());
        product.setMrp(dto.getMrp());
        product.setSellingPrice(dto.getSellingPrice());

        if (dto.getDiscountPercentage() != null) {
            product.setDiscountPercentage(dto.getDiscountPercentage());
        } else if (dto.getMrp().compareTo(dto.getSellingPrice()) > 0) {
            BigDecimal diff = dto.getMrp().subtract(dto.getSellingPrice());
            int discount = diff.multiply(BigDecimal.valueOf(100)).divide(dto.getMrp(), RoundingMode.HALF_UP).intValue();
            product.setDiscountPercentage(discount);
        }

        product.setUnitQuantity(dto.getUnitQuantity().trim());
        product.setStockQuantity(dto.getStockQuantity());
        if (dto.getLowStockThreshold() != null) {
            product.setLowStockThreshold(dto.getLowStockThreshold());
        }
        if (dto.getSku() != null) {
            product.setSku(dto.getSku());
        }
        product.setImageUrl(dto.getImageUrl().trim());
        if (dto.getIsFeatured() != null) {
            product.setIsFeatured(dto.getIsFeatured());
        }
        if (dto.getIsDailyDeal() != null) {
            product.setIsDailyDeal(dto.getIsDailyDeal());
        }
        if (dto.getIsActive() != null) {
            product.setIsActive(dto.getIsActive());
        }

        return mapToDto(productRepository.save(product));
    }

    @Transactional
    public void updateStock(Long id, int newStock) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        if (newStock < 0) {
            throw new BadRequestException("Stock quantity cannot be negative.");
        }
        product.setStockQuantity(newStock);
        productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    public ProductResponseDto mapToDto(Product product) {
        return new ProductResponseDto(
                product.getId(),
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getCategory() != null ? product.getCategory().getSlug() : null,
                product.getName(),
                product.getSlug(),
                product.getBrand(),
                product.getDescription(),
                product.getMrp(),
                product.getSellingPrice(),
                product.getDiscountPercentage(),
                product.getUnitQuantity(),
                product.getStockQuantity(),
                product.getLowStockThreshold(),
                product.getStockQuantity() > 0,
                product.getSku(),
                product.getImageUrl(),
                product.getRating(),
                product.getRatingCount(),
                product.getIsFeatured(),
                product.getIsDailyDeal(),
                product.getIsActive(),
                product.getCreatedAt()
        );
    }

    private String generateSlug(String input) {
        return input.trim().toLowerCase().replaceAll("[^a-z0-9]+", "-");
    }
}
