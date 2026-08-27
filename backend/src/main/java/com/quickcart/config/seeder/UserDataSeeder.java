package com.quickcart.config.seeder;

import com.quickcart.entity.*;
import com.quickcart.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class UserDataSeeder {

    @Value("${quickcart.demo.admin-password:}")
    private String adminPassword;

    @Value("${quickcart.demo.driver-password:}")
    private String driverPassword;

    @Value("${quickcart.demo.customer-password:}")
    private String customerPassword;

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository;
    private final CouponRepository couponRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final PasswordEncoder passwordEncoder;

    public void seedRoles() {
        for (ERole roleName : ERole.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(new Role(roleName));
            }
        }
    }

    public void seedUsers() {
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow();
        Role driverRole = roleRepository.findByName(ERole.ROLE_DELIVERY_PARTNER).orElseThrow();
        Role customerRole = roleRepository.findByName(ERole.ROLE_CUSTOMER).orElseThrow();
        Role managerRole = roleRepository.findByName(ERole.ROLE_STORE_MANAGER).orElseThrow();
        Role supportRole = roleRepository.findByName(ERole.ROLE_SUPPORT_AGENT).orElseThrow();

        // 1. Admin User
        if (userRepository.findByEmail("admin@quickcart.com").isEmpty()) {
            User admin = new User("Alex Vance (Admin)", "admin@quickcart.com", "9876543210", passwordEncoder.encode(adminPassword));
            admin.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
            admin.setRoles(Set.of(adminRole, customerRole));
            userRepository.save(admin);
        }

        // Store Manager User
        if (userRepository.findByEmail("manager@quickcart.com").isEmpty()) {
            User manager = new User("Sam Carter (Store Manager)", "manager@quickcart.com", "9876543213", passwordEncoder.encode(adminPassword));
            manager.setAvatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80");
            manager.setRoles(Set.of(managerRole));
            userRepository.save(manager);
        }

        // Support Agent User
        if (userRepository.findByEmail("support@quickcart.com").isEmpty()) {
            User support = new User("Elena Rostova (Support)", "support@quickcart.com", "9876543214", passwordEncoder.encode(adminPassword));
            support.setAvatarUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80");
            support.setRoles(Set.of(supportRole));
            userRepository.save(support);
        }

        // 2. Delivery Partner User
        if (userRepository.findByEmail("driver@quickcart.com").isEmpty()) {
            User driverUser = new User("Ravi Kumar (Express Rider)", "driver@quickcart.com", "9876543211", passwordEncoder.encode(driverPassword));
            driverUser.setAvatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80");
            driverUser.setRoles(Set.of(driverRole));
            driverUser = userRepository.save(driverUser);

            DeliveryPartner partner = new DeliveryPartner(driverUser, "HERO_ELECTRIC_NYX", "DL-01-QC-8821");
            partner.setDrivingLicenseNumber("DL-98202201992");
            partner.setCurrentLatitude(BigDecimal.valueOf(28.6139));
            partner.setCurrentLongitude(BigDecimal.valueOf(77.2090));
            partner.setRating(BigDecimal.valueOf(4.9));
            partner.setTotalDeliveries(142);
            partner.setIsAvailable(true);
            deliveryPartnerRepository.save(partner);
        }

        // 3. Customer User
        if (userRepository.findByEmail("customer@quickcart.com").isEmpty()) {
            User customer = new User("Riya Gope", "customer@quickcart.com", "9876543212", passwordEncoder.encode(customerPassword));
            customer.setAvatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80");
            customer.setRoles(Set.of(customerRole));
            User savedCustomer = userRepository.save(customer);

            Cart cart = new Cart(savedCustomer);
            cartRepository.save(cart);

            Address address1 = new Address();
            address1.setUser(savedCustomer);
            address1.setLabel("Home");
            address1.setReceiverName("Riya Gope");
            address1.setReceiverPhone("9876543212");
            address1.setStreetAddress("Flat 402, Green Valley Heights, 5th Main");
            address1.setApartmentUnit("Tower B");
            address1.setLandmark("Near City Center Park");
            address1.setCity("New Delhi");
            address1.setState("Delhi");
            address1.setPincode("110001");
            address1.setLatitude(BigDecimal.valueOf(28.6190));
            address1.setLongitude(BigDecimal.valueOf(77.2150));
            address1.setIsDefault(true);
            addressRepository.save(address1);

            Address address2 = new Address();
            address2.setUser(savedCustomer);
            address2.setLabel("Work");
            address2.setReceiverName("Riya Gope");
            address2.setReceiverPhone("9876543212");
            address2.setStreetAddress("Floor 7, Tech Boulevard, Cyber City Sector 24");
            address2.setApartmentUnit("Block C");
            address2.setLandmark("Opposite Metro Pillar 142");
            address2.setCity("Gurugram");
            address2.setState("Haryana");
            address2.setPincode("122002");
            address2.setLatitude(BigDecimal.valueOf(28.4900));
            address2.setLongitude(BigDecimal.valueOf(77.0900));
            address2.setIsDefault(false);
            addressRepository.save(address2);
        }
    }

    public void seedCoupons() {
        if (couponRepository.count() > 0) {
            return;
        }

        Coupon c1 = new Coupon();
        c1.setCode("WELCOME50");
        c1.setDescription("50% flat discount up to ₹100 on your first QuickCart order!");
        c1.setDiscountType(DiscountType.PERCENTAGE);
        c1.setDiscountValue(BigDecimal.valueOf(50));
        c1.setMinOrderValue(BigDecimal.valueOf(149));
        c1.setMaxDiscountAmount(BigDecimal.valueOf(100));
        c1.setValidUntil(LocalDateTime.now().plusMonths(6));
        c1.setUsageLimit(50000);
        c1.setIsActive(true);

        Coupon c2 = new Coupon();
        c2.setCode("FLASH20");
        c2.setDescription("Instant 20% discount on groceries above ₹299 (Max ₹60)");
        c2.setDiscountType(DiscountType.PERCENTAGE);
        c2.setDiscountValue(BigDecimal.valueOf(20));
        c2.setMinOrderValue(BigDecimal.valueOf(299));
        c2.setMaxDiscountAmount(BigDecimal.valueOf(60));
        c2.setValidUntil(LocalDateTime.now().plusMonths(3));
        c2.setUsageLimit(20000);
        c2.setIsActive(true);

        Coupon c3 = new Coupon();
        c3.setCode("QUICK100");
        c3.setDescription("Flat ₹100 discount on big grocery haul orders over ₹799!");
        c3.setDiscountType(DiscountType.FLAT);
        c3.setDiscountValue(BigDecimal.valueOf(100));
        c3.setMinOrderValue(BigDecimal.valueOf(799));
        c3.setValidUntil(LocalDateTime.now().plusMonths(3));
        c3.setUsageLimit(10000);
        c3.setIsActive(true);

        Coupon c4 = new Coupon();
        c4.setCode("SUPERBUY");
        c4.setDescription("Special 15% OFF on midnight snacks and weekend party essentials!");
        c4.setDiscountType(DiscountType.PERCENTAGE);
        c4.setDiscountValue(BigDecimal.valueOf(15));
        c4.setMinOrderValue(BigDecimal.valueOf(199));
        c4.setMaxDiscountAmount(BigDecimal.valueOf(50));
        c4.setValidUntil(LocalDateTime.now().plusMonths(4));
        c4.setUsageLimit(15000);
        c4.setIsActive(true);

        couponRepository.saveAll(List.of(c1, c2, c3, c4));
    }
}
