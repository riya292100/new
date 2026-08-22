# Changelog

All notable changes to the **QuickCart** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
