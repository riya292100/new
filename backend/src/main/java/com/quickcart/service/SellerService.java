package com.quickcart.service;

import com.quickcart.dto.ProductRequestDto;
import com.quickcart.entity.Category;
import com.quickcart.entity.Product;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.CategoryRepository;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getSellerDashboard(String sellerName) {
        String effectiveSeller = (sellerName != null && !sellerName.isBlank()) ? sellerName : "QuickCart Assured";
        List<Product> products = productRepository.findAll();

        long totalListings = products.size();
        long lowStockCount = products.stream().filter(p -> p.getStockQuantity() <= p.getLowStockThreshold()).count();
        BigDecimal totalInventoryValue = products.stream()
                .map(p -> p.getSellingPrice().multiply(BigDecimal.valueOf(p.getStockQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("sellerName", effectiveSeller);
        stats.put("totalListings", totalListings);
        stats.put("lowStockCount", lowStockCount);
        stats.put("totalInventoryValue", totalInventoryValue);
        stats.put("activeOrdersCount", orderRepository.count());
        stats.put("rating", 4.85);
        stats.put("fulfillmentAccuracy", "99.4%");
        stats.put("expressDeliveryCoverage", "100% Pan-India Hubs");

        return stats;
    }

    @Transactional(readOnly = true)
    public List<Product> getSellerProducts() {
        return productRepository.findAll();
    }

    @Transactional
    public Product addSellerProduct(ProductRequestDto dto, String sellerName) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        Product product = new Product();
        product.setName(dto.getName());
        product.setSlug(dto.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-") + "-" + System.currentTimeMillis());
        product.setBrand(dto.getBrand() != null ? dto.getBrand() : "QuickCart Select");
        product.setDescription(dto.getDescription());
        product.setCategory(category);
        product.setSellingPrice(dto.getSellingPrice());
        product.setMrp(dto.getMrp() != null ? dto.getMrp() : dto.getSellingPrice().multiply(BigDecimal.valueOf(1.2)));
        product.setUnitQuantity(dto.getUnitQuantity() != null ? dto.getUnitQuantity() : "1 Unit");
        product.setStockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : 50);
        product.setLowStockThreshold(dto.getLowStockThreshold() != null ? dto.getLowStockThreshold() : 10);
        product.setImageUrl(dto.getImageUrl() != null ? dto.getImageUrl() : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80");
        product.setSku("SKU-" + System.currentTimeMillis());
        product.setIsFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false);
        product.setIsDailyDeal(dto.getIsDailyDeal() != null ? dto.getIsDailyDeal() : false);
        product.setIsOneHourDelivery(true);
        product.setSellerName(sellerName != null ? sellerName : "QuickCart Assured");
        product.setWarranty("1 Year Manufacturer Warranty");

        return productRepository.save(product);
    }
}
