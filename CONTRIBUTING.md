# Contributing to QuickCart

Thank you for your interest in contributing to QuickCart! We welcome contributions to improve the fullstack quick-commerce platform.

---

## 🛠️ Development Setup & Fresh Clone Workflow

### 1. Prerequisites
- **Java 21 JDK** (Eclipse Temurin or OpenJDK 21)
- **Node.js 20+ or 22** & **npm 10+**
- **Python 3.10+** (for AI Demand Engine)
- **Go 1.22+** (for Spatial Telemetry Service)
- **Rust 1.80+** (for Flash Sale Engine)
- **Docker & Docker Compose** (Optional, for fullstack containerized execution)

### 2. Fast One-Command Setup
```bash
# Clone the repository
git clone https://github.com/riya292100/new.git quickcart
cd quickcart

# Install all workspace dependencies
npm run install:all

# Run all test suites across polyglot microservices
npm run test:all
```

---

## 🌿 Continuous Incremental Delivery & Git Guidelines

To maintain a healthy, credible engineering commit history, follow these conventions:

### 1. Small, Incremental Commits Over Large Snapshots
- **Atomic Commits**: Land focused, small changes rather than large monolithic PR dumps.
- **Conventional Commits Format**:
  - `feat(scope): ...` — New capability or user-facing feature.
  - `fix(scope): ...` — Bug fix or error resolution.
  - `refactor(scope): ...` — Code improvement without functional change.
  - `test(scope): ...` — Adding or modifying unit/integration tests.
  - `docs(scope): ...` — Documentation updates and architectural specs.
  - `chore(scope): ...` — Dependency updates, build configs, or CI adjustments.

### 2. Multi-Author & Teammate Identity Configuration
Every contributor must configure their individual git identity locally:
```bash
git config user.name "Your Name"
git config user.email "your.email@company.com"
```

### 3. Pair Programming & Co-Authorship Protocol
When pair-programming or collaborating on a commit, use GitHub's standard `Co-authored-by:` git trailers in the commit message body:
```bash
git commit -m "feat(telemetry): add Haversine spatial radius ring index" -m "Co-authored-by: Jane Doe <jane.doe@example.com>"
```

---

## 🧪 Testing & Quality Standards

Before opening a pull request, ensure all quality gates pass:

1. **Pair Every Change with Matching Tests**:
   - Every modification or new feature in `frontend/src` must be accompanied by matching unit tests under `__tests__/`.
   - Every service or controller in `backend/src/main` must be accompanied by matching unit or integration tests under `backend/src/test`.
2. **Unified Monorepo Test**:
   ```bash
   npm run test:all
   ```
3. **Frontend Code Style & Linting**:
   ```bash
   npm run lint:all
   ```
4. **Backend Tests & Schema Verification**:
   ```bash
   npm run test:backend
   ```

---

## 🚀 Pull Request Workflow

1. Create a scoped feature branch (`git checkout -b feat/your-feature-name`).
2. Land incremental commits with descriptive messages.
3. Verify CI passes on all jobs (Frontend Lint, Frontend Vitest Coverage, Backend JUnit Tests, Python Pytest, Go Test, Docker Stack Build).
4. Update `CHANGELOG.md` with your change notes.
5. Push to your branch and open a Pull Request using the standard [PR Template](.github/PULL_REQUEST_TEMPLATE.md).
