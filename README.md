# ⚡ QuickCart — Instant 10-15 Min Grocery Delivery Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![STOMP / SockJS](https://img.shields.io/badge/WebSocket-STOMP%20%2F%20SockJS-blue.svg)](https://stomp.github.io/)
[![Database](https://img.shields.io/badge/Database-H2%20%2F%20MySQL%208-4479A1.svg)](https://www.mysql.com/)

**QuickCart** is a modern, full-stack, hyper-local quick commerce grocery delivery platform (inspired by Blinkit, Zepto, and Instacart) engineered with a **Java 21 / Spring Boot 3** REST & WebSocket backend and a **React 18 / Vite** glassmorphism storefront.

---

## 🌟 Key Features

### 🛒 1. Customer Storefront
- **Hyper-Local Catalog**: Instant grocery catalog with category filtering, search autocomplete, brand filters, and deals of the day.
- **Micro-Cart & Free Delivery Milestones**: Dynamic cart drawer with live progress toward free delivery (₹199 threshold) and tax calculations.
- **Smart Promo Engine**: Percentage and flat amount discount coupons with minimum order limits and maximum discount caps.
- **Multi-Address Book**: Saved delivery addresses with GPS location detection and 6-digit metro pincode serviceability checks.
- **Real-Time Order Tracking**: 6-stage delivery progression timeline with real-time WebSocket rider GPS map simulation.

### 🚴 2. Delivery Partner (Driver) Portal
- **Real-Time Job Queue**: Accept or reject live orders in your delivery radius.
- **Order Progression Workflow**: Seamlessly advance order stages (`ACCEPTED` ➔ `PACKED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`).
- **One-Click Navigation & Customer Calling**: In-app links to customer address and contact number.

### 🛡️ 3. Admin Control Center
- **Executive KPI Dashboard**: Live metrics for total sales, completed orders, active delivery partners, and daily sales charts.
- **Dark Store Catalog Management**: Add, update, delete, and restock products with instant threshold alerts.
- **Order Dispatcher**: Real-time order monitor with manual/automatic delivery partner assignment.
- **Promotions Manager**: Create and manage promo coupons and discount rules.

---

## 🏗️ Architecture & Tech Stack

### Backend
- **Framework**: Spring Boot 3.3.3
- **Language**: Java 21
- **Security**: Spring Security 6 with JWT (Stateless authentication & Role-Based Access Control)
- **Real-Time Communication**: Spring WebSocket (`@EnableWebSocketMessageBroker`) + SockJS + STOMP
- **Data Persistence**: Spring Data JPA / Hibernate 6
- **Database**: H2 In-Memory (Dev Profile) / MySQL 8 (Prod Profile)
- **API Documentation**: SpringDoc OpenAPI / Swagger UI 2.6.0
- **Utilities**: Lombok, JJWT 0.12.6, Bean Validation (Hibernate Validator)

### Frontend
- **Framework**: React 18.3 + Vite 5.4
- **Routing**: React Router DOM 6
- **State Management**: React Context API (`AuthContext`, `CartContext`, `LocationContext`, `ToastContext`)
- **HTTP Client**: Axios with interceptors for JWT injection
- **Real-Time Client**: `@stomp/stompjs` + `sockjs-client`
- **Icons & UI**: Lucide React + Canvas Confetti + Custom Vanilla CSS Glassmorphism Design System

---

## 📁 Repository Structure

```
quickcart/
├── backend/
│   ├── src/main/java/com/quickcart/
│   │   ├── config/             # Security, WebConfig, WebSocket, DataSeeder
│   │   ├── controller/         # Auth, Product, Cart, Order, Admin, Delivery, Review, Payment
│   │   ├── dto/                # Request & Response Data Transfer Objects
│   │   ├── entity/             # JPA Entities (User, Role, Product, Order, Cart, Coupon, etc.)
│   │   ├── exception/          # Global Exception Handler & Custom Exceptions
│   │   ├── repository/         # Spring Data JPA Repositories
│   │   ├── security/           # JWT Utils, AuthTokenFilter, UserDetails
│   │   ├── service/            # Business Logic & WebSocket Event Broadcasting
│   │   └── QuickCartApplication.java
│   ├── src/main/resources/
│   │   ├── application.yml     # Core Configuration
│   │   ├── application-dev.yml # H2 in-memory DB profile
│   │   ├── application-prod.yml# MySQL 8 production profile
│   │   └── schema-mysql.sql    # DDL schema script
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Header, Footer, Modals, ProductCards, LiveRadarMap, etc.
│   │   ├── context/            # Auth, Cart, Location, Toast context providers
│   │   ├── pages/              # Home, Category, Details, Checkout, Tracking, Admin, Driver
│   │   ├── services/           # Axios API services & STOMP WebSocket service
│   │   ├── App.jsx             # Main Application Routing
│   │   ├── index.css           # Custom Glassmorphism design system
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **JDK 21** or higher
- **Node.js 18+** and **npm**
- **Maven 3.8+** (or use bundled IntelliJ/IDE maven)

---

### Running the Backend

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Compile and launch with Spring Boot:
   ```bash
   mvn spring-boot:run
   ```
   *The server will start on **`http://localhost:8080`** with sample products, categories, coupons, and demo accounts pre-seeded.*

3. Access the API documentation:
   - **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
   - **H2 Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (`jdbc:h2:mem:quickcartdb`, User: `sa`, Password: `""`)

---

### Running the Frontend

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The storefront will be available at **`http://localhost:5173`**.*

---

## 🔐 1-Click Demo Accounts

| Role | Email | Password | Primary Interface |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@quickcart.com` | `Customer@123` | Storefront, Cart, Checkout, Order Tracking |
| **Delivery Rider** | `driver@quickcart.com` | `Driver@123` | Driver Portal (`/delivery-partner`) |
| **Admin** | `admin@quickcart.com` | `Admin@123` | Admin Control Center (`/admin`) |

---

## 📡 Key API Endpoints

### 🔑 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register customer or delivery partner
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Current authenticated user profile

### 🛒 Catalog & Search (`/api`)
- `GET /api/categories` — List active categories
- `GET /api/products` — Filter products by category, price, brand, and sorting
- `GET /api/products/featured` — Get featured items
- `GET /api/products/daily-deals` — Get daily flash deals
- `GET /api/products/search/suggestions?q=` — Real-time instant search suggestions

### 🛍️ Cart & Checkout (`/api/cart`, `/api/orders`, `/api/coupons`)
- `GET /api/cart` / `POST /api/cart/items` — Manage user cart
- `POST /api/coupons/validate` — Validate promo code and calculate discount
- `POST /api/orders` — Create new instant delivery order
- `GET /api/orders/track/{orderNumber}` — Real-time order details and tracking status

### 🛡️ Admin & Inventory (`/api/admin`)
- `GET /api/admin/dashboard/stats` — KPI metrics, sales analytics, top-selling items
- `GET /api/admin/inventory/low-stock` — Products below re-order threshold
- `POST /api/admin/products` / `PUT /api/admin/products/{id}` — CRUD operations for catalog
- `POST /api/admin/orders/assign-partner` — Manual order assignment to delivery partners

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
