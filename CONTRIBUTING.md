# Contributing to QuickCart

Thank you for your interest in contributing to QuickCart! We welcome contributions to improve the fullstack quick-commerce platform.

---

## 🛠️ Development Setup & Fresh Clone Workflow

### 1. Prerequisites
- **Java 21 JDK** (Eclipse Temurin or OpenJDK 21)
- **Node.js 20+ or 22** & **npm 10+**
- **Docker & Docker Compose** (Optional, for full stack containerized execution)

### 2. First-Run Clean Verification
To verify the repository on a fresh machine:
```bash
# 1. Frontend validation
cd frontend
npm ci
npm run format:check
npm run lint
npm run test
npm run coverage
npm run build

# 2. Backend validation
cd ../backend
./mvnw clean test -Dspring.profiles.active=test
```

### 3. Local Development
**Backend**:
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing & Quality Standards

Before opening a pull request, ensure all gates pass:

1. **Pair Every Change with Matching Tests**:
   - Every modification or new feature in `frontend/src` must be accompanied by matching unit tests under `__tests__/`.
   - Every service or controller in `backend/src/main` must be accompanied by matching unit or integration tests under `backend/src/test`.
2. **Frontend Tests & Coverage**:
   ```bash
   cd frontend
   npm run test
   npm run coverage
   ```
3. **Frontend Code Style & Linting**:
   ```bash
   cd frontend
   npm run format:check
   npm run lint
   ```
4. **Backend Tests & Schema Verification**:
   ```bash
   cd backend
   ./mvnw test
   ./mvnw test -Dtest=FlywayMigrationTest
   ```

---

## 🌿 Branching & Pull Requests

1. Create a scoped feature branch (`git checkout -b feat/your-feature-name`).
2. Commit your changes with conventional commit messages (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
3. Ensure CI passes on all jobs (Frontend Lint, Frontend Vitest Coverage, Backend JUnit Tests, Docker Compose Validation, CodeQL Security Scan).
4. Update `CHANGELOG.md` with your changes.
5. Push to your branch and open a Pull Request.
