package com.quickcart.service;

import com.quickcart.dto.AddToCartRequest;
import com.quickcart.dto.CartItemResponse;
import com.quickcart.dto.CartResponse;
import com.quickcart.dto.UpdateCartItemRequest;
import com.quickcart.entity.Cart;
import com.quickcart.entity.CartItem;
import com.quickcart.entity.Product;
import com.quickcart.entity.User;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.CartItemRepository;
import com.quickcart.repository.CartRepository;
import com.quickcart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final AuthService authService;

    @Value("${quickcart.app.freeDeliveryThreshold:199.0}")
    private double freeDeliveryThreshold;

    @Value("${quickcart.app.baseDeliveryFee:25.0}")
    private double baseDeliveryFee;

    @Value("${quickcart.app.platformFee:5.0}")
    private double platformFee;

    @Value("${quickcart.app.taxRate:0.05}")
    private double taxRate;

    @Transactional
    public Cart getOrCreateUserCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(new Cart(user)));
    }

    public CartResponse getCart() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Cart cart = getOrCreateUserCart(currentUser);
        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse addToCart(AddToCartRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Cart cart = getOrCreateUserCart(currentUser);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!product.getIsActive() || product.getStockQuantity() <= 0) {
            throw new BadRequestException("Product is currently out of stock.");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (newQuantity > product.getStockQuantity()) {
                throw new BadRequestException("Only " + product.getStockQuantity() + " units available in stock.");
            }
            item.setQuantity(newQuantity);
            item.setUnitPrice(product.getSellingPrice());
            cartItemRepository.save(item);
        } else {
            if (request.getQuantity() > product.getStockQuantity()) {
                throw new BadRequestException("Only " + product.getStockQuantity() + " units available in stock.");
            }
            CartItem newItem = new CartItem(cart, product, request.getQuantity(), product.getSellingPrice());
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse updateCartItemQuantity(Long itemId, UpdateCartItemRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Cart cart = getOrCreateUserCart(currentUser);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Unauthorized access to cart item.");
        }

        if (request.getQuantity() <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            Product product = item.getProduct();
            if (request.getQuantity() > product.getStockQuantity()) {
                throw new BadRequestException("Only " + product.getStockQuantity() + " units available in stock.");
            }
            item.setQuantity(request.getQuantity());
            item.setUnitPrice(product.getSellingPrice());
            cartItemRepository.save(item);
        }

        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse removeCartItem(Long itemId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Cart cart = getOrCreateUserCart(currentUser);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Unauthorized access to cart item.");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return buildCartResponse(cart);
    }

    @Transactional
    public void clearCart(User user) {
        Cart cart = getOrCreateUserCart(user);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    public CartResponse buildCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = new ArrayList<>();
        BigDecimal itemTotal = BigDecimal.ZERO;
        BigDecimal mrpTotal = BigDecimal.ZERO;
        int totalItemsCount = 0;

        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
                Product product = item.getProduct();
                BigDecimal itemSubtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                BigDecimal itemMrpSubtotal = product.getMrp().multiply(BigDecimal.valueOf(item.getQuantity()));

                itemTotal = itemTotal.add(itemSubtotal);
                mrpTotal = mrpTotal.add(itemMrpSubtotal);
                totalItemsCount += item.getQuantity();

                CartItemResponse itemDto = new CartItemResponse(
                        item.getId(),
                        product.getId(),
                        product.getName(),
                        product.getSlug(),
                        product.getBrand(),
                        product.getImageUrl(),
                        product.getUnitQuantity(),
                        product.getMrp(),
                        item.getUnitPrice(),
                        product.getDiscountPercentage(),
                        item.getQuantity(),
                        itemSubtotal,
                        product.getStockQuantity(),
                        product.getStockQuantity() >= item.getQuantity()
                );
                itemResponses.add(itemDto);
            }
        }

        BigDecimal savings = mrpTotal.subtract(itemTotal);
        if (savings.compareTo(BigDecimal.ZERO) < 0) {
            savings = BigDecimal.ZERO;
        }

        BigDecimal deliveryFee = BigDecimal.ZERO;
        boolean freeDeliveryUnlocked = true;
        BigDecimal amountNeededForFreeDelivery = BigDecimal.ZERO;

        BigDecimal freeThreshold = BigDecimal.valueOf(freeDeliveryThreshold);
        if (itemTotal.compareTo(BigDecimal.ZERO) > 0 && itemTotal.compareTo(freeThreshold) < 0) {
            deliveryFee = BigDecimal.valueOf(baseDeliveryFee);
            freeDeliveryUnlocked = false;
            amountNeededForFreeDelivery = freeThreshold.subtract(itemTotal);
        }

        BigDecimal platformFeeAmount = totalItemsCount > 0 ? BigDecimal.valueOf(platformFee) : BigDecimal.ZERO;
        BigDecimal taxAmount = itemTotal.multiply(BigDecimal.valueOf(taxRate)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = itemTotal.add(deliveryFee).add(platformFeeAmount).add(taxAmount);

        return new CartResponse(
                cart.getId(),
                itemResponses,
                totalItemsCount,
                itemTotal,
                mrpTotal,
                savings,
                deliveryFee,
                platformFeeAmount,
                taxAmount,
                grandTotal,
                freeDeliveryUnlocked,
                amountNeededForFreeDelivery
        );
    }
}
