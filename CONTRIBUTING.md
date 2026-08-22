# Contributing to QuickCart

Thank you for your interest in contributing to QuickCart! We welcome contributions to improve the fullstack quick-commerce platform.

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Java 21 JDK** & **Maven 3.9+**
- **Node.js 20+** & **npm 10+**
- **Docker & Docker Compose** (Optional, for containerized execution)

### 2. Running with Docker Compose
```bash
docker compose up --build
```
Access the application at `http://localhost:5173`.

### 3. Local Development
**Backend**:
```bash
cd backend
mvn spring-boot:run
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing Guidelines

Before opening a pull request, ensure all tests pass:

- **Frontend Tests**:
  ```bash
  cd frontend
  npm test
  ```
- **Backend Tests**:
  ```bash
  cd backend
  mvn test
  ```
- **Linting**:
  ```bash
  cd frontend
  npm run lint
  ```

---

## 🌿 Branching & Pull Requests

1. Fork the repository and create a feature branch (`git checkout -b feature/amazing-feature`).
2. Commit your changes with conventional commit messages (`feat:`, `fix:`, `docs:`, `test:`).
3. Push to your branch and open a Pull Request.
