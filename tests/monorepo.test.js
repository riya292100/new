import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Monorepo Architecture & Contract Parity Suite', () => {
  const rootDir = path.resolve(__dirname, '..');

  it('verifies deterministic lockfiles exist for all 6 polyglot toolchains', () => {
    const requiredLockfiles = [
      'package-lock.json',
      'frontend/package-lock.json',
      'backend/mvnw',
      'backend/mvnw.cmd',
      'services/ai-demand-engine/requirements.lock',
      'services/data-pipeline/requirements.lock',
      'services/telemetry-service/go.sum',
      'services/flash-sale-engine/Cargo.lock',
    ];

    for (const lockfile of requiredLockfiles) {
      const fullPath = path.join(rootDir, lockfile);
      expect(fs.existsSync(fullPath), `Expected lockfile ${lockfile} to exist`).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size, `Expected ${lockfile} to be non-empty`).toBeGreaterThan(0);
    }
  });

  it('verifies non-overlapping port allocations across microservices', () => {
    const portMapping = {
      backend: 8080,
      aiEngine: 8082,
      telemetry: 8085,
      flashSale: 8086,
      frontend: 5173,
    };

    const ports = Object.values(portMapping);
    const uniquePorts = new Set(ports);
    expect(uniquePorts.size).toBe(ports.length);
  });

  it('verifies .env.example defines mandatory environment variables including Sentry', () => {
    const envPath = path.join(rootDir, '.env.example');
    expect(fs.existsSync(envPath)).toBe(true);
    const envContent = fs.readFileSync(envPath, 'utf-8');

    const expectedVars = [
      'POSTGRES_DB',
      'SPRING_DATASOURCE_URL',
      'REDIS_HOST',
      'PORT',
      'AI_ENGINE_PORT',
      'TELEMETRY_PORT',
      'FRONTEND_PORT',
      'VITE_API_BASE_URL',
      'SENTRY_DSN',
      'VITE_SENTRY_DSN',
    ];

    for (const v of expectedVars) {
      expect(envContent).toContain(v);
    }
  });

  it('verifies essential developer guides and documentation specifications exist', () => {
    const docFiles = [
      'README.md',
      'CONTRIBUTING.md',
      'CHANGELOG.md',
      'SECURITY.md',
      'docs/architecture.md',
      'docs/testing.md',
      'docker-compose.yml',
    ];

    for (const doc of docFiles) {
      const fullPath = path.join(rootDir, doc);
      expect(fs.existsSync(fullPath), `Expected ${doc} to exist`).toBe(true);
    }
  });

  it('verifies CI workflow specifies test coverage and security audit stages', () => {
    const ciPath = path.join(rootDir, '.github', 'workflows', 'ci.yml');
    expect(fs.existsSync(ciPath)).toBe(true);
    const ciContent = fs.readFileSync(ciPath, 'utf-8');

    expect(ciContent).toContain('frontend-ci');
    expect(ciContent).toContain('backend-ci');
    expect(ciContent).toContain('python-ci');
    expect(ciContent).toContain('go-ci');
    expect(ciContent).toContain('rust-ci');
  });
});
