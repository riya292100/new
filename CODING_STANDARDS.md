# 📐 QuickCart Engineering Standards & Code Quality Guidelines

This document defines the architectural conventions, coding style, type standards, and commit guidelines enforced across the QuickCart codebase.

---

## 🏷️ 1. Commit Message Convention (Conventional Commits)

All commits in QuickCart must adhere to the **Conventional Commits 1.0.0** specification:

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Supported Types
| Type | Purpose | Example |
|---|---|---|
| `feat` | Adds a new user-facing or API feature | `feat(backend): implement Redis GEO store discovery` |
| `fix` | Fixes a bug or unhandled exception | `fix(frontend): resolve cart drawer badge overflow` |
| `refactor` | Code refactoring without changing behavior | `refactor(auth): extract TokenProvider into separate bean` |
| `perf` | Performance or query optimization | `perf(db): add composite index on dark_store_id and status` |
| `test` | Adding or updating tests | `test(order): add concurrency stress test for checkout` |
| `docs` | Documentation changes only | `docs(readme): add system architecture flowchart` |
| `ci` | CI/CD pipeline and GitHub Actions | `ci(workflows): add CodeQL static analysis job` |
| `chore` | Dependency upgrades or build tool tweaks | `chore(deps): bump spring-boot-starter-parent to 3.3.3` |

---

## ☕ 2. Backend Coding Standards (Java 21 & Spring Boot 3)

### Clean Hexagonal / Layered Architecture
1. **Controller Layer (`com.quickcart.controller`)**:
   - Only responsible for HTTP request validation, status codes, and delegation to service layer.
   - Must use `ApiResponse<T>` wrapper for standardized JSON payloads.
   - Must specify `@Valid` on all `@RequestBody` DTOs.
2. **Service Layer (`com.quickcart.service`)**:
   - Contains all domain business logic and state validation.
   - Must use `@Transactional(readOnly = true)` for query methods, and `@Transactional` for state modifications.
3. **Repository Layer (`com.quickcart.repository`)**:
   - Extends Spring Data `JpaRepository<T, ID>`.
   - Thread-sensitive mutations must use explicit lock annotations (e.g., `@Lock(LockModeType.PESSIMISTIC_WRITE)`).
4. **DTOs & Immutability**:
   - Use Java `record` types or `@Value` / `@Getter` immutable classes with Lombok for request/response bodies.
   - Never expose JPA entity classes directly in controller endpoints.

### Exception Handling & Logging
- Throw domain exceptions extending `RuntimeException` (e.g. `ResourceNotFoundException`, `InsufficientStockException`).
- Catch and format them centrally in `GlobalExceptionHandler` with appropriate HTTP status codes.
- Use SLF4J structured logging: `log.info("Order created successfully: orderId={}, userId={}", order.getId(), user.getId());`.

---

## ⚛️ 3. Frontend Coding Standards (React 18 & Vite)

### Component Design & Hierarchy
- **Functional Components Only**: Use React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- **Atomic File Structure**:
  - Keep components modular (< 200 lines per file).
  - Extract reusable UI units into `src/components/` and page-level views into `src/pages/`.
- **Prop Validation & Type Checking**:
  - Use JSDoc annotations for props and state models to ensure IDE autocompletion and type safety:
  ```javascript
  /**
   * @typedef {Object} ProductCardProps
   * @property {number} id
   * @property {string} name
   * @property {number} price
   * @property {Function} onAddToCart
   */
  ```

### State Management & Performance
- Use React Context for global domain state (`AuthContext`, `CartContext`).
- Keep local state local; avoid unnecessary global state.
- Wrap expensive calculations in `useMemo` and event handlers passed to children in `useCallback`.

---

## 🎨 4. Code Formatting & Linting

### Prettier (Code Style)
Configured in `.prettierrc.json`:
- **Semi**: `true`
- **SingleQuote**: `true`
- **TabWidth**: `2`
- **PrintWidth**: `100`
- **TrailingComma**: `"es5"`

Run format verification:
```bash
npm run format:check  # Check formatting
npm run format        # Auto-format files
```

### ESLint
Configured in `eslint.config.js` using flat config format. Enforces:
- No unused variables (`no-unused-vars`).
- React Hooks rules (`react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`).
- No console debugging artifacts in production code.

---

## 🧪 5. Testing Requirements

- **100% Test Pairing Rule**: Every new endpoint or UI component must include a corresponding automated unit/integration test file.
- **Frontend**: Vitest + React Testing Library (`src/**/__tests__/*.test.jsx`).
- **Backend**: JUnit 5 + Mockito + MockMvc (`backend/src/test/java/**`).
- **Coverage Target**: Minimum **80% code branch coverage** on all business services.
