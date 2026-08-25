# Changelog

All notable changes to the **QuickCart** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.4.0] - 2026-08-25

### Added
- **Clothes & Fashion Shopping Feature**:
  - Dedicated clothes shopping page (`ClothesShoppingPage.jsx` at `/clothes`, `/fashion`, `/clothing`, `/cloths`) with department filters (Men's Wear, Women's Wear, Unisex), garment type pills (T-Shirts, Jeans, Shirts, Dresses, Activewear, Hoodies, Ethnic Wear, Trousers), size filter dropdown, and sorting options.
  - Interactive Garment Card (`ClothCard.jsx`) with instant on-card size selection chips (`XS`, `S`, `M`, `L`, `XL`, `XXL`, `30`, `32`, `34`, `36`), MRP strikethroughs, discount percentages, fabric specs, and add to cart.
  - Garment Detail Modal (`ClothDetailModal.jsx`) featuring high-resolution photography, thumbnail selector, interactive size guide modal (Chest, Length, Waist measurements), color swatches, fabric/fit specifications, and 15-minute quick delivery assurance.
  - Clothes showcase section & promotional banner added to `HomePage.jsx`.
  - Navigation placement directly before Admin Panel in `Header.jsx` (main nav & user profile dropdown), `RoleSwitcher.jsx` (demo bar), and `BottomNav.jsx` (mobile navigation tab).
  - Seeded 8+ rich apparel items with size metadata, pricing, discounts, and brand tags in `DataSeeder.java` and `demoConfig.js`.
  - Added unit test suites for `ClothCard`, `ClothDetailModal`, and `ClothesShoppingPage`.

---

## [1.3.0] - 2026-08-25

### Removed
- **Marketplace & E-Commerce Additions**:
  - Removed Seller Hub (`SellerController`, `SellerService`, `SellerDashboard`, `ROLE_SELLER`, `/seller` route).
  - Removed Wishlist System (`WishlistController`, `WishlistService`, `Wishlist`, `WishlistItem`, `WishlistContext`, `WishlistPage`, `/wishlist` route).
  - Removed Pincode Engine (`PincodeController`, marketplace ETA calculations).
  - Removed Invoice Generator (`InvoiceModal`, GST tax receipt generation).
  - Removed non-grocery product categories (Mobiles, Laptops, Fashion, Consumer Electronics) and marketplace product metadata (specifications table, warranty, EMI calculator).

### Restored
- **QuickCart Grocery Delivery Platform**:
  - Restored 10-minute grocery delivery branding and catalog with 11 core categories and 50+ rich grocery items.
  - Restored grocery product details modal (nutritional information table, related grocery items, grocery reviews).
  - Restored grocery cart, checkout (10-15 min delivery slot, tip selector, delivery instructions), and live radar order tracking.
  - Restored 3 core demo roles (Customer, Delivery Partner, Administrator).

---

## [1.2.0] - 2026-08-22

### Added
- **Monorepo & Developer Tooling**:
  - Root `package.json` with npm workspaces and unified lifecycle commands (`npm run test:all`, `npm run lint:all`).
  - Root `Makefile` for single-step build and test orchestration (`make test-all`).
  - VS Code DevContainer definition (`.devcontainer/devcontainer.json`).
- **Structured Logging & Robustness**:
  - Client-side structured logger (`utils/logger.js`) with log levels, metadata tagging, and error serialization.
  - Replaced bare console statements and silent error swallowing across all pages and context providers.
- **Isolated Frontend Page Tests**:
  - Added unit test suites with mocked API services for `HomePage`, `DeliveryPartnerPortal`, `CategoryPage`, `OrderHistoryPage`, `ProfilePage`, and `Header`.
- **CSS Modularization**:
  - Extracted shared component styling into `styles/components.css`.
- **Linter & Formatter Recognition**:
  - Committed explicit `.eslintrc.cjs` and `.prettierrc.json` configs for multi-tool static analyzer compatibility.

---

## [1.1.0] - 2026-08-22

### Added
- **Coverage & Test Thresholds**:
  - Integrated `@vitest/coverage-v8` with enforced CI coverage thresholds.
  - Added 20 component and unit test suites across core application features.
- **Backend Test Profile**:
  - Dedicated `application-test.yml` for isolated in-memory H2 database testing with zero external dependencies.
- **CI/CD Hardening**:
  - Added Prettier format verification and `npm audit --audit-level=critical` security checks in GitHub Actions.

---

## [1.0.0] - 2026-08-22

### Added
- **Core Fullstack Platform**:
  - Spring Boot 3.3.3 Java 21 backend with stateless JWT authentication & RBAC.
  - React 18 / Vite 5 frontend with custom design system and glassmorphism aesthetic.
- **Real-Time Architecture**:
  - WebSocket STOMP live GPS radar order tracking and rider dispatch simulator.
- **Mobile & Android App**:
  - Capacitor Android Studio project configured for Google Play Store `.aab` / `.apk` release.
  - Progressive Web App (PWA) manifest with service worker offline caching and 1-click install banner.
- **Testing & Quality**:
  - Vitest + React Testing Library component and unit test suites.
  - JUnit 5 & Mockito service test suite for backend business logic.
- **DevOps & Containerization**:
  - Multi-stage Dockerfiles for backend (JRE 21 Alpine) and frontend (Nginx Alpine).
  - Root `docker-compose.yml` with MySQL 8.0 health checks.
  - Automated GitHub Actions CI/CD workflows and Dependabot configuration.
- **Security & Standards**:
  - Centralized validation utilities and sanitization against XSS.
  - Removal of hardcoded secrets and extraction of configurable demo environment presets.
  - Mandatory Google Play Store Privacy Policy page.
