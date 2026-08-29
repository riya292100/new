# QuickCart Security & Compliance Architecture

QuickCart implements Defense-in-Depth across all frontend, backend, and infrastructure layers.

---

## 1. Authentication & JWT Security

- **Algorithm**: HMAC-SHA256 with minimum 256-bit cryptographic keys.
- **Short-Lived Access Tokens**: Configurable expiration (default 24h) with sliding-window refresh tokens.
- **Secure Password Storage**: Passwords hashed using Spring Security `BCryptPasswordEncoder` with strength factor 10+.
- **Role-Based Access Control (RBAC)**: Enforced via Spring Security `@PreAuthorize` annotations across Customer (`ROLE_CUSTOMER`), Delivery Partner (`ROLE_DRIVER`), and Admin (`ROLE_ADMIN`) tiers.

---

## 2. Secrets Management & Fail-Fast Validation

- **Zero Hardcoded Secrets**: Hardcoded default credentials have been eradicated from production seeders and configuration files.
- **Environment Variable Fallbacks**: In local development, safe development defaults are used. In production profile (`SPRING_PROFILES_ACTIVE=prod`), missing secrets will cause the application to fail fast at startup.
- **Log Masking**: MDC Logging and Logback configurations mask sensitive headers (`Authorization`), passwords, CVVs, and credit card numbers.

---

## 3. Web & API Security

- **CORS Configuration**: Restricts cross-origin requests to authorized origins.
- **Input Validation**: All incoming REST request bodies are validated using Jakarta Bean Validation (`@Valid`, `@NotNull`, `@NotBlank`, `@Email`, `@Size`, `@Min`, `@Max`).
- **SQL Injection Prevention**: Spring Data JPA Hibernate parameterization and versioned Flyway migrations guarantee complete protection against SQL injection.
- **XSS & Content Security**: React auto-escaping, safe DOM sanitization, and Nginx HTTP response security headers.

---

## 4. Resilience & Rate Limiting

- **Resilience4j Rate Limiting**: Enforces strict request throttles on sensitive endpoints (e.g. login, payment initiation, order placement) to prevent brute-force attacks and DDoS.
- **Circuit Breakers**: Payment gateway and external service calls automatically trip into OPEN state during third-party service outages, preventing thread starvation.
