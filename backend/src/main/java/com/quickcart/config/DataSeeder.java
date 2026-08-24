package com.quickcart.config;

import com.quickcart.entity.*;
import com.quickcart.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    @Value("${quickcart.demo.admin-password:Admin@123}")
    private String adminPassword;

    @Value("${quickcart.demo.driver-password:Driver@123}")
    private String driverPassword;

    @Value("${quickcart.demo.customer-password:Customer@123}")
    private String customerPassword;

    @Value("${quickcart.demo.seller-password:Seller@123}")
    private String sellerPassword;

    @Value("${quickcart.demo.seeding-enabled:true}")
    private boolean seedingEnabled;

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final CouponRepository couponRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final RestaurantRepository restaurantRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedingEnabled) {
            logger.info("Demo data seeding is disabled by configuration.");
            return;
        }
        seedRoles();
        seedUsers();
        seedCategoriesAndProducts();
        seedCoupons();
        seedRestaurants();
        logger.info("QuickCart sample data seeded successfully.");
    }

    private void seedRoles() {
        for (ERole roleName : ERole.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(new Role(roleName));
            }
        }
    }

    private void seedUsers() {
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow();
        Role driverRole = roleRepository.findByName(ERole.ROLE_DELIVERY_PARTNER).orElseThrow();
        Role customerRole = roleRepository.findByName(ERole.ROLE_CUSTOMER).orElseThrow();
        Role sellerRole = roleRepository.findByName(ERole.ROLE_SELLER).orElseThrow();

        // 1. Admin User
        if (userRepository.findByEmail("admin@quickcart.com").isEmpty()) {
            User admin = new User("Alex Vance (Admin)", "admin@quickcart.com", "9876543210", passwordEncoder.encode(adminPassword));
            admin.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
            admin.setRoles(Set.of(adminRole, customerRole));
            userRepository.save(admin);
        }

        // 2. Delivery Partner User
        User driverUser = null;
        if (userRepository.findByEmail("driver@quickcart.com").isEmpty()) {
            driverUser = new User("Ravi Kumar (Express Rider)", "driver@quickcart.com", "9876543211", passwordEncoder.encode(driverPassword));
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

        // 4. Marketplace Seller User
        if (userRepository.findByEmail("seller@quickcart.com").isEmpty()) {
            User seller = new User("SuperComNet India (Verified Seller)", "seller@quickcart.com", "9876543213", passwordEncoder.encode(sellerPassword));
            seller.setAvatarUrl("https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80");
            seller.setRoles(Set.of(sellerRole, customerRole));
            userRepository.save(seller);
        }
    }

    private void seedCategoriesAndProducts() {
        if (categoryRepository.count() > 0) {
            return;
        }

        // 12 Indian Marketplace Categories
        Category cMobiles = categoryRepository.save(new Category("Mobiles & Tablets", "mobiles-tablets", "Smartphones, flagship 5G phones, iPads & tablets with 1-hour delivery", "Smartphone", "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80", 1));
        Category cElectronics = categoryRepository.save(new Category("Electronics & Audio", "electronics-audio", "Wireless earbuds, Bluetooth speakers, noise-canceling headphones & smartwatches", "Headphones", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80", 2));
        Category cComputers = categoryRepository.save(new Category("Computers & Laptops", "computers-accessories", "MacBooks, gaming laptops, mechanical keyboards & wireless mice", "Laptop", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80", 3));
        Category cFashion = categoryRepository.save(new Category("Fashion & Apparel", "fashion-apparel", "Men's & women's trendy clothing, denim jeans, sneakers & watches", "Shirt", "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80", 4));
        Category cHome = categoryRepository.save(new Category("Home & Kitchen", "home-kitchen", "Smart air fryers, mixer grinders, cookware & home decor", "Home", "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80", 5));
        Category cGrocery = categoryRepository.save(new Category("Groceries & Essentials", "groceries-essentials", "Daily farm fresh fruits, dairy, organic atta, tea & snacks", "ShoppingBag", "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80", 6));
        Category cBeauty = categoryRepository.save(new Category("Beauty & Personal Care", "beauty-personal-care", "Skincare serums, grooming trimmers, luxury perfumes & haircare", "Sparkles", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80", 7));
        Category cSports = categoryRepository.save(new Category("Sports & Fitness", "sports-fitness", "Gym dumbbells, yoga mats, badminton racquets & sports shoes", "Activity", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80", 8));
        Category cBooks = categoryRepository.save(new Category("Books & Stationery", "books-stationery", "Best-selling self-help books, fiction novels, diaries & fine pens", "BookOpen", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80", 9));
        Category cToys = categoryRepository.save(new Category("Toys & Baby Care", "toys-baby-care", "Building blocks, remote control cars, baby diapers & feeding essentials", "Gift", "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80", 10));
        Category cAppliances = categoryRepository.save(new Category("Home Appliances", "home-appliances", "Smart televisions, inverter refrigerators & automatic washing machines", "Tv", "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=600&auto=format&fit=crop&q=80", 11));
        Category cDining = categoryRepository.save(new Category("QuickCart Dining", "dining-experiences", "Curated table reservations at Michelin-star & rooftop restaurants", "Utensils", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80", 12));

        // 1. Mobiles & Tablets
        createProduct(cMobiles, "Apple iPhone 15 Pro (128 GB, Natural Titanium)", "iphone-15-pro-128gb", "Apple",
                "A17 Pro chip with 6-core GPU, titanium design with ceramic shield front, 48MP main camera with 3x telephoto, and Action button.",
                BigDecimal.valueOf(134900), BigDecimal.valueOf(127999), 5, "1 Unit", 25, "SKU-MOB-001",
                "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.8), 2450, true, true, "SuperComNet India", "1 Year Apple Warranty",
                "Display: 6.1\" Super Retina XDR OLED | Processor: A17 Pro | RAM: 8 GB | Storage: 128 GB | OS: iOS 17",
                "Titanium Design, 48MP Pro Camera, USB-C 3.0 Speeds, Dynamic Island, 23h Battery");

        createProduct(cMobiles, "Samsung Galaxy S24 Ultra 5G (AI Enabled, 256 GB, Titanium Gray)", "samsung-galaxy-s24-ultra-256gb", "Samsung",
                "Galaxy AI features like Circle to Search, Live Translate, 200MP camera with 5x optical zoom, Snapdragon 8 Gen 3 processor, and built-in S-Pen.",
                BigDecimal.valueOf(134999), BigDecimal.valueOf(119999), 11, "1 Unit", 30, "SKU-MOB-002",
                "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.7), 1890, true, false, "RetailNet India", "1 Year Comprehensive Warranty",
                "Display: 6.8\" Dynamic AMOLED 2X 120Hz | Processor: Snapdragon 8 Gen 3 | RAM: 12 GB | Storage: 256 GB",
                "Galaxy AI, 200MP Quad Telephoto, Titanium Frame, 5000 mAh Battery, Embedded S-Pen");

        createProduct(cMobiles, "OnePlus 12 5G (Flowy Emerald, 16GB RAM, 512GB)", "oneplus-12-5g-512gb", "OnePlus",
                "Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera with Sony LYT-808 sensor, 5400 mAh battery with 100W SUPERVOOC charging.",
                BigDecimal.valueOf(69999), BigDecimal.valueOf(64999), 7, "1 Unit", 40, "SKU-MOB-003",
                "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.6), 1120, false, true, "TrueCom Retail", "1 Year Brand Warranty",
                "Display: 6.82\" 2K ProXDR 120Hz | Processor: Snapdragon 8 Gen 3 | RAM: 16 GB | 100W SuperVOOC Charger in box",
                "100W Fast Charge, Hasselblad Camera System, 5400mAh Battery, Dual Cryo-velocity VC Cooling");

        // 2. Electronics & Audio
        createProduct(cElectronics, "boAt Rockerz 550 Over-Ear Wireless Headphones", "boat-rockerz-550-wireless", "boAt",
                "50mm dynamic drivers with deep bass, 20 hours playback, physical noise isolation, plush ear cushions, and Bluetooth v5.0.",
                BigDecimal.valueOf(4999), BigDecimal.valueOf(1799), 64, "1 Unit", 85, "SKU-ELE-001",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.4), 4850, true, true, "boAt Official Store", "1 Year Replacement Warranty",
                "Driver: 50mm Dynamic | Playtime: 20 Hours | Battery: 500 mAh | Connectivity: Bluetooth v5.0 + AUX",
                "50mm Dynamic Drivers, Ergonomic Over-Ear Fit, 20-Hour Playtime, Dual Mode Connectivity");

        createProduct(cElectronics, "Sony WH-1000XM5 Active Noise Canceling Wireless Headphones", "sony-wh-1000xm5-anc", "Sony",
                "Industry-leading noise cancellation with two processors and 8 microphones, Ultra-comfortable design, 30 hours battery life with quick charge.",
                BigDecimal.valueOf(34990), BigDecimal.valueOf(26990), 23, "1 Unit", 20, "SKU-ELE-002",
                "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.9), 3200, true, false, "Electronics Hub", "1 Year Sony India Warranty",
                "ANC: Dual HD V1 Processors | Battery: 30 Hours | Codecs: LDAC, AAC, SBC | Weight: 250 g",
                "Auto NC Optimizer, Multipoint Connection, Speak-to-Chat, 3-min Charge for 3h Play");

        createProduct(cElectronics, "Noise ColorFit Pulse 3 Smart Watch with BT Calling", "noise-colorfit-pulse-3", "Noise",
                "1.96-inch TFT display, Bluetooth calling with dialpad, 100+ sports modes, 24x7 heart rate and SpO2 monitor, 7 days battery.",
                BigDecimal.valueOf(4999), BigDecimal.valueOf(1499), 70, "1 Unit", 110, "SKU-ELE-003",
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.3), 6400, false, true, "Noise Direct Store", "1 Year Manufacturer Warranty",
                "Display: 1.96\" TFT 550 Nits | Battery: 7 Days | Water Resistance: IP68 | Sensors: Heart Rate, SpO2",
                "Bluetooth Calling, 100+ Sports Modes, IP68 Waterproof, 150+ Cloud Watch Faces");

        // 3. Computers & Laptops
        createProduct(cComputers, "Apple MacBook Air M3 (13.6-inch Liquid Retina, 8GB, 256GB SSD)", "apple-macbook-air-m3", "Apple",
                "Supercharged by the M3 chip with 8-core CPU and 10-core GPU, up to 18 hours battery life, 1080p FaceTime HD camera, MagSafe 3 charging.",
                BigDecimal.valueOf(114900), BigDecimal.valueOf(104990), 9, "1 Unit", 15, "SKU-CMP-001",
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.9), 980, true, false, "Apple Authorized Reseller", "1 Year Apple Warranty",
                "Display: 13.6\" Liquid Retina (2560x1664) | Chip: Apple M3 8-Core | RAM: 8GB Unified | Storage: 256GB SSD",
                "M3 Powerhouse, Fanless Silent Design, 18-Hour Battery, MagSafe 3, Dual External Display Support");

        createProduct(cComputers, "Logitech MX Master 3S Wireless Performance Mouse", "logitech-mx-master-3s", "Logitech",
                "8K DPI any-surface tracking, quiet clicks, MagSpeed electromagnetic scrolling (1000 lines/sec), cross-computer Flow control.",
                BigDecimal.valueOf(10995), BigDecimal.valueOf(8495), 23, "1 Unit", 45, "SKU-CMP-002",
                "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.8), 2100, true, true, "SuperComNet India", "2 Years Limited Hardware Warranty",
                "DPI: 200-8000 DPI | Battery: 70 Days on full charge | Connectivity: Bluetooth + Logi Bolt USB Receiver",
                "Quiet Click Switches, 8000 DPI Darkfield Sensor, MagSpeed Scroll Wheel, Easy-Switch for 3 Devices");

        // 4. Fashion & Apparel
        createProduct(cFashion, "Levi's Men's 511 Slim Fit Stretchable Denim Jeans", "levis-511-slim-fit-jeans", "Levi's",
                "Classic 511 slim fit cut with stretch denim for all-day comfort, zip fly with button closure, iconic back leather patch.",
                BigDecimal.valueOf(3999), BigDecimal.valueOf(2199), 45, "1 Pair (Size 32)", 60, "SKU-FAS-001",
                "https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.5), 1870, false, true, "Levi's Official Store", "30 Days Easy Return",
                "Material: 99% Cotton, 1% Elastane | Fit: Slim Fit | Rise: Mid Rise | Wash Care: Machine Wash Cold",
                "Stretch Denim Fabric, Classic 5-Pocket Styling, Durable Stitching, Versatile Medium Indigo Wash");

        createProduct(cFashion, "Puma Smashic Unisex Casual Classic White Sneakers", "puma-smashic-sneakers-white", "Puma",
                "Clean tennis-inspired silhouette with durable synthetic leather upper, SoftFoam+ comfort sockliner for instant cushioning.",
                BigDecimal.valueOf(4499), BigDecimal.valueOf(1999), 56, "1 Pair (UK 8)", 75, "SKU-FAS-002",
                "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.4), 3120, true, true, "Puma Official Hub", "30 Days Easy Return",
                "Upper: Synthetic Leather | Sole: Rubber | Insole: SoftFoam+ Cushion | Closure: Lace-up",
                "SoftFoam+ Step-in Comfort, Grippy Rubber Outsole, Timeless Streetwear Styling");

        // 5. Home & Kitchen
        createProduct(cHome, "Philips Digital Air Fryer HD9252 with Rapid Air Technology", "philips-digital-air-fryer-hd9252", "Philips",
                "Air fry with up to 90% less fat, touch screen with 7 pre-set cooking programs, 4.1L capacity, keep warm function, dishwasher safe parts.",
                BigDecimal.valueOf(11995), BigDecimal.valueOf(6999), 42, "1 Unit (4.1 L)", 35, "SKU-HOM-001",
                "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.7), 2900, true, true, "Philips Home Store", "2 Years Philips India Warranty",
                "Capacity: 4.1 Litres | Power: 1400 Watts | Presets: 7 Cooking Modes | Auto Shut-off: Yes",
                "Rapid Air 360 Technology, Digital Touch Screen, NutriU Recipe App Access, Easy Clean Non-stick Basket");

        // 6. Groceries & Essentials
        createProduct(cGrocery, "Aashirvaad Superior MP Sharbati Whole Wheat Atta 10kg", "aashirvaad-sharbati-atta-10kg", "Aashirvaad",
                "100% whole wheat grains harvested from Madhya Pradesh Sehore fields, making rotis softer, fluffier and nutrient-rich.",
                BigDecimal.valueOf(540), BigDecimal.valueOf(465), 14, "10 kg Pack", 150, "SKU-GRO-001",
                "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.8), 8400, false, true, "QuickCart Dark Store #01", "100% Quality Assured",
                "Grain: 100% MP Sharbati Wheat | Shelf Life: 6 Months | Dietary: High Dietary Fibre, No Added Maida",
                "0% Maida, Retains Natural Moisture for Softer Rotis, Packed with Iron and Fibre");

        createProduct(cGrocery, "Amul Butter Pasteurized (Pack of 2 x 500g)", "amul-butter-pasteurized-500g-pack", "Amul",
                "Utterly Butterly Delicious iconic Indian salted butter churned from pure fresh cow and buffalo milk cream.",
                BigDecimal.valueOf(570), BigDecimal.valueOf(525), 8, "1 kg (2x500g)", 200, "SKU-GRO-002",
                "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.9), 12000, true, true, "Amul Fresh Dairy Hub", "Keep Refrigerated at 4°C",
                "Ingredients: Milk Fat 80%, Moisture 16%, Salt 3% | Brand: Amul (The Taste of India)",
                "Rich Creamy Texture, Classic Savory Flavor, Churned from Pure Milk Cream");

        // 7. Beauty & Personal Care
        createProduct(cBeauty, "Philips OneBlade Hybrid Beard Trimmer & Shaver QP2821", "philips-oneblade-trimmer-qp2821", "Philips",
                "Revolutionary hybrid styler that can trim, shave, and create clean lines and edges on any length of hair, dual protection system.",
                BigDecimal.valueOf(2499), BigDecimal.valueOf(1749), 30, "1 Unit", 80, "SKU-BEA-001",
                "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.6), 5100, true, true, "Philips Grooming Direct", "2 Years Worldwide Guarantee",
                "Blade Tech: OneBlade 360 | Runtime: 45 Mins | Wet & Dry: 100% Waterproof | Combs: 5-in-1 Adjustable",
                "Cuts Hair Not Skin, 100% Waterproof, 45 Min Cordless Shave, Long-lasting Replacement Blade");

        // 8. Sports & Fitness
        createProduct(cSports, "Decathlon Domyos Hexagonal Rubber Dumbbells Set (2 x 5kg)", "decathlon-hex-dumbbells-5kg", "Decathlon",
                "Ergonomic knurled steel grip, heavy-duty hexagonal rubber coating that won't roll or damage flooring during intense workouts.",
                BigDecimal.valueOf(2999), BigDecimal.valueOf(1999), 33, "10 kg Pair", 45, "SKU-SPO-001",
                "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.8), 1650, false, true, "Decathlon Sports India", "2 Years Guarantee",
                "Weight: 2 x 5 kg (10 kg total) | Core: Cast Iron | Outer: Non-scratch Rubber | Grip: Knurled Chrome",
                "Hexagonal Anti-Roll Shape, Floor-Safe Rubber Coating, Knurled Slip-Resistant Grip");

        // 9. Books & Stationery
        createProduct(cBooks, "Atomic Habits by James Clear (Hardcover Edition)", "atomic-habits-james-clear-hardcover", "Penguin Random House",
                "An Easy & Proven Way to Build Good Habits & Break Bad Ones. Over 15 million copies sold globally.",
                BigDecimal.valueOf(899), BigDecimal.valueOf(499), 44, "Hardcover", 90, "SKU-BOK-001",
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.9), 18200, true, true, "National Book Depository", "100% Original Print",
                "Author: James Clear | Language: English | Publisher: Penguin Life | Pages: 320 | Binding: Hardcover",
                "#1 New York Times Bestseller, Proven 4-Step Habit Framework, High Quality Paper");

        // 10. Toys & Baby Care
        createProduct(cToys, "LEGO Technic Monster Jam Dragon Truck 2-in-1 Building Kit", "lego-technic-monster-jam-dragon", "LEGO",
                "2-in-1 pull-back monster truck that rebuilds into a Crocodile Buggy with dragon spikes and fiery horn details for kids 7+.",
                BigDecimal.valueOf(1999), BigDecimal.valueOf(1499), 25, "217 Pieces", 55, "SKU-TOY-001",
                "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.7), 890, false, true, "LEGO Official Store", "100% Genuine LEGO Guarantee",
                "Piece Count: 217 | Age Group: 7+ Years | Action: Pull-Back Motor Mechanism | Model: 42149",
                "2-in-1 Rebuildable Model, Powerful Pull-Back Action, Authentic Monster Jam Graphics");

        // 11. Home Appliances
        createProduct(cAppliances, "LG 65-inch 4K Ultra HD Smart OLED TV (4K Cinema HDR, Dolby Atmos)", "lg-65-inch-oled-4k-smart-tv", "LG",
                "Self-lit OLED pixels for infinite contrast, α9 AI Processor 4K Gen6, 120Hz refresh rate, Dolby Vision IQ and Dolby Atmos audio.",
                BigDecimal.valueOf(219990), BigDecimal.valueOf(149990), 32, "1 Unit (65-inch)", 12, "SKU-APP-001",
                "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80",
                BigDecimal.valueOf(4.9), 620, true, false, "LG Electronics India", "3 Years Panel Warranty",
                "Screen: 65\" 4K OLED (3840x2160) | Refresh Rate: 120 Hz | OS: webOS 24 | Sound: 40W 2.2 Channel Dolby Atmos",
                "Self-Lit OLED Pixels, Dolby Vision IQ & Atmos, 0.1ms Response Time for Gaming, Hands-Free Voice Control");
    }

    private void createProduct(Category category, String name, String slug, String brand, String description,
                               BigDecimal mrp, BigDecimal sellingPrice, Integer discount, String unit,
                               Integer stock, String sku, String image, BigDecimal rating, Integer ratingCount,
                               Boolean isFeatured, Boolean isDailyDeal, String seller, String warranty,
                               String specs, String highlights) {
        Product p = new Product();
        p.setCategory(category);
        p.setName(name);
        p.setSlug(slug);
        p.setBrand(brand);
        p.setDescription(description);
        p.setMrp(mrp);
        p.setSellingPrice(sellingPrice);
        p.setDiscountPercentage(discount);
        p.setUnitQuantity(unit);
        p.setStockQuantity(stock);
        p.setLowStockThreshold(10);
        p.setSku(sku);
        p.setImageUrl(image);
        p.setRating(rating);
        p.setRatingCount(ratingCount);
        p.setIsFeatured(isFeatured);
        p.setIsDailyDeal(isDailyDeal);
        p.setIsActive(true);
        p.setIsOneHourDelivery(true);
        p.setSellerName(seller);
        p.setWarranty(warranty);
        p.setSpecifications(specs);
        p.setHighlights(highlights);
        p.setGalleryImages(image);
        productRepository.save(p);
    }

    private void seedCoupons() {
        if (couponRepository.count() > 0) return;
        Coupon c1 = new Coupon();
        c1.setCode("QUICK100");
        c1.setDescription("Flat ₹100 instant discount on your order");
        c1.setDiscountType(DiscountType.FLAT);
        c1.setDiscountValue(BigDecimal.valueOf(100));
        c1.setMinOrderValue(BigDecimal.valueOf(499));
        c1.setMaxDiscountAmount(BigDecimal.valueOf(100));
        c1.setValidUntil(LocalDateTime.now().plusMonths(3));
        c1.setUsageLimit(500);
        c1.setIsActive(true);
        couponRepository.save(c1);

        Coupon c2 = new Coupon();
        c2.setCode("BHARAT20");
        c2.setDescription("20% off on electronics & fashion mega deals");
        c2.setDiscountType(DiscountType.PERCENTAGE);
        c2.setDiscountValue(BigDecimal.valueOf(20));
        c2.setMinOrderValue(BigDecimal.valueOf(999));
        c2.setMaxDiscountAmount(BigDecimal.valueOf(500));
        c2.setValidUntil(LocalDateTime.now().plusMonths(3));
        c2.setUsageLimit(1000);
        c2.setIsActive(true);
        couponRepository.save(c2);

        Coupon c3 = new Coupon();
        c3.setCode("EXPRESSFREE");
        c3.setDescription("Free 1-Hour SuperFast Express Delivery on orders above ₹499");
        c3.setDiscountType(DiscountType.FLAT);
        c3.setDiscountValue(BigDecimal.valueOf(49));
        c3.setMinOrderValue(BigDecimal.valueOf(499));
        c3.setMaxDiscountAmount(BigDecimal.valueOf(49));
        c3.setValidUntil(LocalDateTime.now().plusMonths(3));
        c3.setUsageLimit(5000);
        c3.setIsActive(true);
        couponRepository.save(c3);
    }

    private void seedRestaurants() {
        if (restaurantRepository.count() > 0) return;
        Restaurant r1 = new Restaurant();
        r1.setName("Trattoria Da Enzo al 29");
        r1.setSlug("trattoria-da-enzo-al-29");
        r1.setDescription("Authentic Roman classics with hand-made tonnarelli cacio e pepe and crispy artichokes.");
        r1.setCountry("Italy");
        r1.setCity("Rome");
        r1.setAddress("Via dei Vascellari, 29, 00153 Roma RM, Italy");
        r1.setCuisine("Italian");
        r1.setPriceLevel("$$");
        r1.setRating(4.9);
        r1.setReviewCount(1420);
        r1.setImageUrl("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80");
        r1.setOpeningHours("12:30 PM - 11:00 PM");
        r1.setPhone("+39 06 581 2260");
        r1.setWebsite("https://www.daenzoal29.com");
        r1.setLatitude(41.8876);
        r1.setLongitude(12.4776);
        r1.setIsDineInAvailable(true);
        r1.setIsVegetarianFriendly(true);
        r1.setIsVeganFriendly(false);
        r1.setActive(true);
        restaurantRepository.save(r1);
    }
}
