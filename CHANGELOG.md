# Changelog

All notable changes to the **QuickCart** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
