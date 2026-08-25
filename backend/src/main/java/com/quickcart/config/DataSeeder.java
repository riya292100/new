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
    }

    private void seedCategoriesAndProducts() {
        if (categoryRepository.count() > 0) {
            return;
        }

        // 1. Fruits & Vegetables
        Category c1 = categoryRepository.save(new Category("Fruits & Vegetables", "fruits-vegetables", "Farm-fresh handpicked fruits, leafy greens & organic vegetables", "Carrot", "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80", 1));
        // 2. Dairy & Breakfast
        Category c2 = categoryRepository.save(new Category("Dairy & Breakfast", "dairy-breakfast", "Fresh milk, paneer, curd, eggs, butter & breakfast staples", "Milk", "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=600&auto=format&fit=crop&q=80", 2));
        // 3. Snacks & Munchies
        Category c3 = categoryRepository.save(new Category("Snacks & Munchies", "snacks-munchies", "Crispy chips, nachos, roasted nuts, popcorn & cookies", "Cookie", "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80", 3));
        // 4. Beverages & Juices
        Category c4 = categoryRepository.save(new Category("Beverages & Cold Drinks", "beverages", "Fresh fruit juices, sparkling soda, iced teas & kombucha", "Coffee", "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80", 4));
        // 5. Bakery & Bread
        Category c5 = categoryRepository.save(new Category("Bakery & Breads", "bakery-breads", "Artisanal sourdough, brown bread, croissants, muffins & cakes", "Croissant", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80", 5));
        // 6. Instant Food & Ready Meals
        Category c6 = categoryRepository.save(new Category("Instant Food", "instant-food", "Ramen noodles, instant pasta, frozen snacks & ready-to-eat meals", "Soup", "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80", 6));
        // 7. Personal Care & Hygiene
        Category c7 = categoryRepository.save(new Category("Personal Care", "personal-care", "Skincare, haircare, body washes, sanitizers & grooming kits", "Sparkles", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80", 7));
        // 8. Household Essentials & Cleaning
        Category c8 = categoryRepository.save(new Category("Household Essentials", "household-essentials", "Detergents, floor cleaners, trash bags, kitchen foil & tissues", "Home", "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80", 8));
        // 9. Baby Care
        Category c9 = categoryRepository.save(new Category("Baby Care", "baby-care", "Premium diapers, baby wipes, baby lotions & organic feeding food", "Baby", "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80", 9));
        // 10. Pet Supplies
        Category c10 = categoryRepository.save(new Category("Pet Supplies", "pet-supplies", "Nutritious dog & cat kibble, treats, pet shampoo & chew toys", "Dog", "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop&q=80", 10));
        // 11. Electronics & Accessories
        Category c11 = categoryRepository.save(new Category("Electronics & Accessories", "electronics-accessories", "Fast charging cables, powerbanks, earbuds, batteries & adapters", "Zap", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80", 11));
        // 12. Clothes & Fashion
        Category c12 = categoryRepository.save(new Category("Clothes & Fashion", "clothes-fashion", "Premium t-shirts, shirts, denim jeans, cotton hoodies, ethnic kurtas & dresses", "Shirt", "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80", 12));

        // Seed rich real-world items
        List<Product> products = List.of(
                // Fruits & Veggies
                createProd(c1, "Farm Fresh Alphonso Mangoes", "al-fresh-mangoes", "Nature's Basket", "Handpicked sweet & aromatic Ratnagiri Alphonso mangoes.", BigDecimal.valueOf(450), BigDecimal.valueOf(349), "1 kg (approx 3-4 pcs)", 45, "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80", true, true, 4.8, 128),
                createProd(c1, "Fresh Royal Gala Red Apples", "fresh-gala-apples", "Organic Farms", "Crisp, sweet Washington style red gala apples rich in antioxidants.", BigDecimal.valueOf(180), BigDecimal.valueOf(145), "4 pcs (approx 500g)", 80, "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80", true, false, 4.6, 94),
                createProd(c1, "Hydroponic English Cucumber", "hydro-english-cucumber", "Urban Greens", "Pesticide-free crisp English cucumbers ideal for fresh salads.", BigDecimal.valueOf(60), BigDecimal.valueOf(42), "500 g", 120, "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500&auto=format&fit=crop&q=80", false, false, 4.5, 45),
                createProd(c1, "Organic Baby Spinach", "organic-baby-spinach", "Leafy Delight", "Pre-washed tender baby spinach leaves, rich in iron & fiber.", BigDecimal.valueOf(50), BigDecimal.valueOf(38), "250 g pack", 35, "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80", true, true, 4.7, 82),
                createProd(c1, "Fresh Vine Ripe Red Tomatoes", "fresh-red-tomatoes", "Nature's Basket", "Plump juicy tomatoes directly sourced from local greenhouse farms.", BigDecimal.valueOf(40), BigDecimal.valueOf(28), "1 kg", 90, "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80", false, false, 4.4, 60),

                // Dairy & Breakfast
                createProd(c2, "Amul Taaza Homogenised Toned Milk", "amul-taaza-milk", "Amul", "Nutritious pasteurised toned milk with zero preservatives.", BigDecimal.valueOf(34), BigDecimal.valueOf(31), "500 ml pouch", 150, "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80", true, false, 4.9, 320),
                createProd(c2, "Fresh Malai Paneer", "fresh-malai-paneer", "Mother Dairy", "Soft, melt-in-mouth cottage cheese crafted from rich buffalo milk.", BigDecimal.valueOf(95), BigDecimal.valueOf(82), "200 g pack", 60, "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80", true, true, 4.8, 210),
                createProd(c2, "Farm Fresh Brown Organic Eggs", "brown-organic-eggs", "Eggoz", "Antibiotic-free, nutrient-dense brown eggs with golden yolk.", BigDecimal.valueOf(110), BigDecimal.valueOf(89), "Pack of 6", 75, "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=80", true, false, 4.7, 188),
                createProd(c2, "Amul Salted Butter", "amul-salted-butter", "Amul", "Classic delicious salted butter made from pure fresh cream.", BigDecimal.valueOf(60), BigDecimal.valueOf(56), "100 g", 110, "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80", false, false, 4.9, 410),
                createProd(c2, "Epigamia Greek Yogurt (Wild Blueberry)", "epigamia-blueberry-yogurt", "Epigamia", "High protein Greek yogurt with real blueberry puree.", BigDecimal.valueOf(60), BigDecimal.valueOf(49), "90 g cup", 40, "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80", true, true, 4.6, 75),

                // Snacks & Munchies
                createProd(c3, "Lay's Classic Salted Potato Chips", "lays-classic-salted", "Lay's", "Thinly sliced, crispy golden potato chips seasoned with fine salt.", BigDecimal.valueOf(30), BigDecimal.valueOf(28), "90 g", 140, "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80", true, false, 4.6, 230),
                createProd(c3, "Doritos Sweet Chilli Nacho Crisps", "doritos-sweet-chilli", "Doritos", "Crunchy corn tortilla triangles coated in exotic sweet chilli spice.", BigDecimal.valueOf(50), BigDecimal.valueOf(42), "130 g", 85, "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=500&auto=format&fit=crop&q=80", true, true, 4.7, 140),
                createProd(c3, "Roasted California Almonds", "roasted-california-almonds", "Nutty Gritties", "Lightly salted, oven roasted crunchy jumbo California almonds.", BigDecimal.valueOf(250), BigDecimal.valueOf(199), "200 g pouch", 55, "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&auto=format&fit=crop&q=80", true, false, 4.8, 92),
                createProd(c3, "Dark Fantasy Choco Fills Cookies", "dark-fantasy-choco-fills", "Sunfeast", "Crunchy chocolate biscuit outer crust bursting with rich molten choco cream.", BigDecimal.valueOf(90), BigDecimal.valueOf(75), "300 g pack", 95, "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80", false, true, 4.8, 175),
                createProd(c3, "Act II Butter Lovers Popcorn", "act-ii-butter-popcorn", "Act II", "Instant microwave popcorn drenched in warm buttery goodness.", BigDecimal.valueOf(40), BigDecimal.valueOf(33), "85 g", 65, "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&auto=format&fit=crop&q=80", false, false, 4.5, 62),

                // Beverages & Juices
                createProd(c4, "Raw Pressery Cold Pressed Valencia Orange Juice", "raw-valencia-orange-juice", "Raw Pressery", "100% natural cold pressed orange juice with no added sugar.", BigDecimal.valueOf(120), BigDecimal.valueOf(99), "250 ml bottle", 50, "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&auto=format&fit=crop&q=80", true, true, 4.7, 130),
                createProd(c4, "Coca-Cola Zero Sugar Can", "coca-cola-zero-can", "Coca-Cola", "The iconic Coca-Cola refreshing fizz with zero sugar & calories.", BigDecimal.valueOf(40), BigDecimal.valueOf(38), "300 ml can", 180, "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80", true, false, 4.8, 380),
                createProd(c4, "Red Bull Energy Drink", "red-bull-energy-can", "Red Bull", "Vitalizes body and mind with premium taurine and B-group vitamins.", BigDecimal.valueOf(125), BigDecimal.valueOf(115), "250 ml can", 90, "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80", true, false, 4.7, 210),
                createProd(c4, "Paper Boat Tender Coconut Water", "paper-boat-coconut-water", "Paper Boat", "Pure, hydrating natural coconut water packed with essential electrolytes.", BigDecimal.valueOf(60), BigDecimal.valueOf(48), "200 ml tetra", 110, "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=500&auto=format&fit=crop&q=80", false, true, 4.6, 95),

                // Bakery & Bread
                createProd(c5, "The Baker's Dozen 100% Whole Wheat Bread", "whole-wheat-bread-loaf", "The Baker's Dozen", "Artisanal stoneground whole wheat loaf baked fresh daily.", BigDecimal.valueOf(55), BigDecimal.valueOf(48), "400 g loaf", 70, "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80", true, false, 4.6, 115),
                createProd(c5, "Fresh Butter Croissants", "fresh-butter-croissants", "French Crust", "Flaky, golden, buttery layered French pastries baked to perfection.", BigDecimal.valueOf(140), BigDecimal.valueOf(110), "Pack of 2 (160g)", 25, "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80", true, true, 4.8, 88),
                createProd(c5, "Garlic & Herb Sourdough Baguette", "garlic-herb-baguette", "Artisan Bakehouse", "Naturally fermented crusty sourdough infused with roasted garlic & parsley.", BigDecimal.valueOf(95), BigDecimal.valueOf(79), "250 g", 20, "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500&auto=format&fit=crop&q=80", false, false, 4.7, 42),

                // Instant Food
                createProd(c6, "Maggi 2-Minute Masala Instant Noodles", "maggi-masala-noodles-4pack", "Nestle Maggi", "India's favorite instant noodles infused with signature aromatic spices.", BigDecimal.valueOf(56), BigDecimal.valueOf(52), "4 x 70g (280g)", 200, "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80", true, false, 4.9, 540),
                createProd(c6, "Samyang 2x Spicy Hot Chicken Ramen", "samyang-2x-spicy-ramen", "Samyang", "Extreme Korean spicy stir-fried instant noodles for heat lovers.", BigDecimal.valueOf(150), BigDecimal.valueOf(125), "140 g pack", 40, "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80", true, true, 4.5, 160),
                createProd(c6, "McCain French Fries (Ready to Fry)", "mccain-french-fries", "McCain", "Crispy golden restaurant style potato fries ready in 3 minutes.", BigDecimal.valueOf(130), BigDecimal.valueOf(109), "420 g pack", 50, "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80", false, false, 4.6, 95),

                // Personal Care
                createProd(c7, "Dettol Original Germ Protection Liquid Handwash", "dettol-handwash-refill", "Dettol", "Trusted 99.9% germ defense formula with classic pine scent.", BigDecimal.valueOf(99), BigDecimal.valueOf(85), "675 ml refill pouch", 85, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80", true, false, 4.8, 260),
                createProd(c7, "Nivea Soft Light Moisturizing Cream", "nivea-soft-cream", "Nivea", "Non-greasy nourishing daily body and face cream with Vitamin E & Jojoba.", BigDecimal.valueOf(190), BigDecimal.valueOf(155), "200 ml jar", 60, "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80", true, true, 4.7, 145),
                createProd(c7, "Colgate MaxFresh Peppermint Toothpaste", "colgate-maxfresh-peppermint", "Colgate", "Infused with cooling breath strips for intense minty freshness.", BigDecimal.valueOf(120), BigDecimal.valueOf(98), "150 g tube", 110, "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80", false, false, 4.6, 175),

                // Household Essentials
                createProd(c8, "Surf Excel Matic Top Load Liquid Detergent", "surf-excel-matic-liquid", "Surf Excel", "Tough stain removal in 1 wash inside washing machine.", BigDecimal.valueOf(220), BigDecimal.valueOf(189), "1 L bottle", 70, "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&auto=format&fit=crop&q=80", true, false, 4.8, 310),
                createProd(c8, "Vim Lemon Dishwash Gel", "vim-dishwash-gel", "Vim", "Concentrated lemon power cuts through heavy grease easily.", BigDecimal.valueOf(115), BigDecimal.valueOf(99), "500 ml bottle", 90, "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=500&auto=format&fit=crop&q=80", false, true, 4.7, 220),
                createProd(c8, "Origami 3-Ply Luxury Kitchen Towel Tissues", "origami-kitchen-towels", "Origami", "Highly absorbent virgin paper towels for food wrapping & cleaning.", BigDecimal.valueOf(90), BigDecimal.valueOf(72), "2 Rolls pack", 60, "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=500&auto=format&fit=crop&q=80", false, false, 4.5, 78),

                // Baby Care
                createProd(c9, "Pampers Premium Pants Diapers (Medium)", "pampers-premium-m", "Pampers", "Ultra soft, breathable 360-degree cottony fit with up to 12 hours absorption.", BigDecimal.valueOf(699), BigDecimal.valueOf(549), "Pack of 34 Pants", 40, "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=80", true, true, 4.8, 190),
                createProd(c9, "Himalaya Gentle Baby Wipes (Aloe & Lotus)", "himalaya-baby-wipes", "Himalaya", "Alcohol-free soothing wet wipes enriched with Indian Lotus & Aloe Vera.", BigDecimal.valueOf(175), BigDecimal.valueOf(139), "Pack of 72 Wipes", 65, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80", true, false, 4.7, 110),

                // Pet Supplies
                createProd(c10, "Pedigree Adult Dry Dog Food (Chicken & Veg)", "pedigree-dog-food-chicken", "Pedigree", "Complete and balanced nutrition with 20% protein for strong muscles.", BigDecimal.valueOf(380), BigDecimal.valueOf(329), "1.2 kg bag", 45, "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&auto=format&fit=crop&q=80", true, false, 4.7, 140),
                createProd(c10, "Whiskas Adult Cat Food (Ocean Fish in Jelly)", "whiskas-cat-wet-food", "Whiskas", "Delicious gourmet wet meal packed with essential Omega 3 & zinc.", BigDecimal.valueOf(50), BigDecimal.valueOf(42), "85 g pouch", 90, "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=80", true, true, 4.8, 85),

                // Electronics
                createProd(c11, "boAt 65W GaN Fast Charger Adapter", "boat-65w-gan-charger", "boAt", "Ultra-compact dual port Type-C charger with Power Delivery & QuickCharge.", BigDecimal.valueOf(1499), BigDecimal.valueOf(899), "1 unit", 25, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=80", true, true, 4.6, 95),
                createProd(c11, "Duracell Ultra Alkaline AA Batteries", "duracell-ultra-aa-4pack", "Duracell", "Long-lasting power with Powercheck technology for high-drain devices.", BigDecimal.valueOf(180), BigDecimal.valueOf(149), "Pack of 4", 80, "https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=500&auto=format&fit=crop&q=80", false, false, 4.9, 210),
                createProd(c11, "Portronics Braided Type-C Fast Charging Cable", "portronics-type-c-cable", "Portronics", "Durable nylon braided 60W charging & sync cable (1.2m length).", BigDecimal.valueOf(299), BigDecimal.valueOf(179), "1 pc (1.2m)", 60, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80", true, false, 4.5, 75),

                // Clothes & Fashion
                createProd(c12, "Classic Crewneck Cotton T-Shirt", "classic-crewneck-cotton-tshirt", "Roadster", "100% pre-shrunk combed cotton t-shirt with ribbed collar. Sizes: S, M, L, XL, XXL.", BigDecimal.valueOf(799), BigDecimal.valueOf(399), "Size: S, M, L, XL, XXL", 60, "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80", true, true, 4.8, 185),
                createProd(c12, "Slim Fit Stretch Denim Jeans", "slim-fit-stretch-denim-jeans", "Levi's", "Authentic 511 slim fit indigo wash stretch denim jeans. Sizes: 30, 32, 34, 36.", BigDecimal.valueOf(2799), BigDecimal.valueOf(1599), "Size: 30, 32, 34, 36", 40, "https://images.unsplash.com/photo-1542272604-780c96856592?w=500&auto=format&fit=crop&q=80", true, false, 4.9, 240),
                createProd(c12, "Oxford Casual Button-Down Shirt", "oxford-casual-buttondown-shirt", "Allen Solly", "Crisp tailored 100% breathable cotton shirt for casual and office wear. Sizes: M, L, XL, XXL.", BigDecimal.valueOf(1699), BigDecimal.valueOf(899), "Size: M, L, XL, XXL", 45, "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80", true, true, 4.7, 130),
                createProd(c12, "Floral Print Summer Cotton Midi Dress", "floral-print-summer-midi-dress", "H&M", "Breezy A-line tiered silhouette dress with sweetheart neckline. Sizes: XS, S, M, L, XL.", BigDecimal.valueOf(1999), BigDecimal.valueOf(999), "Size: XS, S, M, L, XL", 35, "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=80", true, false, 4.8, 115),
                createProd(c12, "Dry-Fit Athletic Training T-Shirt", "dryfit-athletic-training-tshirt", "Nike", "Dri-FIT moisture wicking sportswear jersey with reflective accents. Sizes: S, M, L, XL, XXL.", BigDecimal.valueOf(1495), BigDecimal.valueOf(899), "Size: S, M, L, XL, XXL", 50, "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=80", true, true, 4.8, 210),
                createProd(c12, "Cozy Fleece Pullover Winter Hoodie", "cozy-fleece-pullover-hoodie", "Zara Man", "Heavyweight 360 GSM cotton-poly brushed fleece hoodie with kangaroo pocket. Sizes: M, L, XL, XXL.", BigDecimal.valueOf(2499), BigDecimal.valueOf(1349), "Size: M, L, XL, XXL", 30, "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80", false, true, 4.7, 95),
                createProd(c12, "Handcrafted Silk Blend Festive Kurta", "handcrafted-silk-blend-kurta", "FabIndia", "Intricate mandarin collar festive ethnic kurta crafted from fine silk blend. Sizes: S, M, L, XL.", BigDecimal.valueOf(2290), BigDecimal.valueOf(1299), "Size: S, M, L, XL", 25, "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80", false, false, 4.6, 78),
                createProd(c12, "Tailored Stretch Chino Trousers", "tailored-stretch-chino-trousers", "Van Heusen", "Smart flat-front khaki chinos in premium stretch cotton twill. Sizes: 30, 32, 34, 36.", BigDecimal.valueOf(1899), BigDecimal.valueOf(1099), "Size: 30, 32, 34, 36", 40, "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=80", true, false, 4.7, 86)
        );

        productRepository.saveAll(products);
    }

    private Product createProd(Category cat, String name, String slug, String brand, String desc, BigDecimal mrp, BigDecimal sp, String unit, int stock, String img, boolean feat, boolean daily, double rating, int ratingCount) {
        Product p = new Product();
        p.setCategory(cat);
        p.setName(name);
        p.setSlug(slug);
        p.setBrand(brand);
        p.setDescription(desc);
        p.setMrp(mrp);
        p.setSellingPrice(sp);
        int discount = mrp.subtract(sp).multiply(BigDecimal.valueOf(100)).divide(mrp, 0, java.math.RoundingMode.HALF_UP).intValue();
        p.setDiscountPercentage(discount);
        p.setUnitQuantity(unit);
        p.setStockQuantity(stock);
        p.setLowStockThreshold(10);
        p.setSku("QC-" + slug.toUpperCase().replace("-", "").substring(0, Math.min(8, slug.length())));
        p.setImageUrl(img);
        p.setIsFeatured(feat);
        p.setIsDailyDeal(daily);
        p.setRating(BigDecimal.valueOf(rating));
        p.setRatingCount(ratingCount);
        p.setIsActive(true);
        return p;
    }

    private void seedCoupons() {
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

    private void seedRestaurants() {
        if (restaurantRepository.count() > 0) return;

        Restaurant r1 = Restaurant.builder()
                .name("Trattoria da Enzo al 29")
                .slug("trattoria-da-enzo-rome")
                .description("Authentic Roman trattoria renowned for signature Carbonara, Cacio e Pepe, and fresh burrata.")
                .cuisine("Italian")
                .country("Italy")
                .city("Rome")
                .address("Via dei Vascellari, 29, 00153 Roma RM")
                .latitude(41.8885)
                .longitude(12.4764)
                .rating(4.9)
                .reviewCount(340)
                .priceLevel("$$")
                .imageUrl("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=60")
                .galleryImages("https://images.unsplash.com/photo-1551183053-bf91a1d81141,https://images.unsplash.com/photo-1579684947550-22e945225d9a")
                .openingHours("12:30 PM - 11:00 PM")
                .phone("+39 06 581 2260")
                .website("https://trattoriadaenzo.it")
                .isVegetarianFriendly(true)
                .isVeganFriendly(false)
                .isDineInAvailable(true)
                .isDeliveryAvailable(true)
                .isTakeawayAvailable(true)
                .active(true)
                .build();

        Restaurant r2 = Restaurant.builder()
                .name("Sukiyabashi Jiro Roppongi")
                .slug("sukiyabashi-jiro-tokyo")
                .description("World-class Edomae sushi experience crafted with meticulously selected seasonal seafood.")
                .cuisine("Japanese")
                .country("Japan")
                .city("Tokyo")
                .address("Roppongi Hills Keyakizaka Dori 3F, Minato-ku, Tokyo")
                .latitude(35.6596)
                .longitude(139.7297)
                .rating(4.95)
                .reviewCount(520)
                .priceLevel("$$$$")
                .imageUrl("https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=60")
                .galleryImages("https://images.unsplash.com/photo-1611143669185-af224c5e3252,https://images.unsplash.com/photo-1553621042-f6e147245754")
                .openingHours("11:30 AM - 9:30 PM")
                .phone("+81 3-5413-6626")
                .website("https://sushi-jiro.jp")
                .isVegetarianFriendly(false)
                .isVeganFriendly(false)
                .isDineInAvailable(true)
                .isDeliveryAvailable(false)
                .isTakeawayAvailable(false)
                .active(true)
                .build();

        Restaurant r3 = Restaurant.builder()
                .name("Gramercy Tavern")
                .slug("gramercy-tavern-new-york")
                .description("Contemporary American culinary staple featuring wood-fired seasonal dining and farm-to-table menus.")
                .cuisine("American")
                .country("USA")
                .city("New York")
                .address("42 E 20th St, New York, NY 10003")
                .latitude(40.7384)
                .longitude(-73.9884)
                .rating(4.8)
                .reviewCount(410)
                .priceLevel("$$$")
                .imageUrl("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60")
                .galleryImages("https://images.unsplash.com/photo-1544025162-d76694265947,https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c")
                .openingHours("12:00 PM - 10:00 PM")
                .phone("+1 212-477-0777")
                .website("https://gramercytavern.com")
                .isVegetarianFriendly(true)
                .isVeganFriendly(true)
                .isDineInAvailable(true)
                .isDeliveryAvailable(true)
                .isTakeawayAvailable(true)
                .active(true)
                .build();

        Restaurant r4 = Restaurant.builder()
                .name("Le Comptoir du Relais")
                .slug("le-comptoir-du-relais-paris")
                .description("Classic Parisian bistro serving elevated French gastronomy and artisanal charcuterie.")
                .cuisine("French")
                .country("France")
                .city("Paris")
                .address("9 Carr de l'Odéon, 75006 Paris")
                .latitude(48.8517)
                .longitude(2.3387)
                .rating(4.75)
                .reviewCount(280)
                .priceLevel("$$$")
                .imageUrl("https://images.unsplash.com/photo-1502301103665-0b95cc738daf?w=800&auto=format&fit=crop&q=60")
                .galleryImages("https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c,https://images.unsplash.com/photo-1555396273-367ea4eb4db5")
                .openingHours("12:00 PM - 11:00 PM")
                .phone("+33 1 44 27 07 97")
                .website("https://hotel-paris-relais-saint-germain.com")
                .isVegetarianFriendly(true)
                .isVeganFriendly(false)
                .isDineInAvailable(true)
                .isDeliveryAvailable(false)
                .isTakeawayAvailable(true)
                .active(true)
                .build();

        Restaurant r5 = Restaurant.builder()
                .name("Dishoom Shoreditch")
                .slug("dishoom-shoreditch-london")
                .description("Paying homage to the heritage Irani cafes of Bombay with signature black daal and gunpowder potatoes.")
                .cuisine("Indian")
                .country("UK")
                .city("London")
                .address("7 Boundary St, London E2 7JE")
                .latitude(51.5244)
                .longitude(-0.0772)
                .rating(4.85)
                .reviewCount(680)
                .priceLevel("$$")
                .imageUrl("https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=60")
                .galleryImages("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4,https://images.unsplash.com/photo-1565557623262-b51c2513a641")
                .openingHours("8:00 AM - 11:00 PM")
                .phone("+44 20 7420 9324")
                .website("https://dishoom.com")
                .isVegetarianFriendly(true)
                .isVeganFriendly(true)
                .isDineInAvailable(true)
                .isDeliveryAvailable(true)
                .isTakeawayAvailable(true)
                .active(true)
                .build();

        Restaurant r6 = Restaurant.builder()
                .name("6 Ballygunge Place")
                .slug("6-ballygunge-place-kolkata")
                .description("Heritage Bengali fine dining celebrating Daab Chingri, Kosha Mangsho, and authentic Kolkata flavors.")
                .cuisine("Indian")
                .country("India")
                .city("Kolkata")
                .address("6, Ballygunge Place, Kolkata, West Bengal 700019")
                .latitude(22.5280)
                .longitude(88.3659)
                .rating(4.8)
                .reviewCount(450)
                .priceLevel("$$")
                .imageUrl("https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60")
                .galleryImages("https://images.unsplash.com/photo-1585937421612-70a008356fbe,https://images.unsplash.com/photo-1555396273-367ea4eb4db5")
                .openingHours("12:00 PM - 10:30 PM")
                .phone("+91 33 2460 3922")
                .website("https://6ballygungeplace.in")
                .isVegetarianFriendly(true)
                .isVeganFriendly(false)
                .isDineInAvailable(true)
                .isDeliveryAvailable(true)
                .isTakeawayAvailable(true)
                .active(true)
                .build();

        Restaurant r7 = Restaurant.builder()
                .name("Toscano Italian Bistro & Wine Bar")
                .slug("toscano-ub-city-bengaluru")
                .description("Charming open-air Italian restaurant and wine bar overlooking UB City amphitheatre.")
                .cuisine("Italian")
                .country("India")
                .city("Bengaluru")
                .address("UB City, Vittal Mallya Rd, Bengaluru, Karnataka 560001")
                .latitude(12.9719)
                .longitude(77.5960)
                .rating(4.75)
                .reviewCount(380)
                .priceLevel("$$$")
                .imageUrl("https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&auto=format&fit=crop&q=60")
                .galleryImages("https://images.unsplash.com/photo-1555396273-367ea4eb4db5,https://images.unsplash.com/photo-1517248135467-4c7edcad34c4")
                .openingHours("11:00 AM - 11:00 PM")
                .phone("+91 80 4173 8800")
                .website("https://toscano.co.in")
                .isVegetarianFriendly(true)
                .isVeganFriendly(true)
                .isDineInAvailable(true)
                .isDeliveryAvailable(true)
                .isTakeawayAvailable(true)
                .active(true)
                .build();

        restaurantRepository.saveAll(List.of(r1, r2, r3, r4, r5, r6, r7));
    }
}
