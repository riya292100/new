# 🛡️ Security Policy & Vulnerability Disclosure

QuickCart is committed to maintaining the highest security standards for our users, customer data, and financial transaction systems.

---

## 📋 Supported Versions

We actively provide security patches and vulnerability fixes for the following release branches:

| Version Branch | Supported | Security Update Status |
|---|---|---|
| `v1.3.x` | ✅ Yes | Actively maintained with zero-day patches |
| `v1.2.x` | ✅ Yes | Critical vulnerability patches only |
| `< 1.2.0` | ❌ No | Deprecated; please upgrade to latest release |

---

## 🚨 Reporting a Vulnerability

If you discover a potential security flaw, vulnerability, or exposure in QuickCart, please report it privately:

1. **Do not disclose the issue publicly** via GitHub Issues, Discussions, or social media.
2. Submit a private advisory via **GitHub Security Advisories**:
   👉 [Open a Security Advisory](https://github.com/riya292100/new/security/advisories/new)
3. Alternatively, email full details to: **`security@quickcart.com`**

### What to Include in Your Report:
- Vulnerability classification (e.g. SQL Injection, XSS, CSRF, IDOR, Broken Authentication).
- Clear step-by-step reproduction instructions or Proof-of-Concept (PoC) payload.
- Affected endpoints, parameters, or source code files.
- Impact assessment on confidential data or financial ledgers.

---

## ⏱️ Response SLA & Remediation Timeline

Our security engineering team adheres to strict response SLAs:

| Phase | Timeline | Action |
|---|---|---|
| **Acknowledgment** | Within **24 Hours** | Initial confirmation of report receipt. |
| **Triage & Validation** | Within **72 Hours** | Reproduction and severity assignment (CVSS v3.1). |
| **Fix Development** | Within **7 Days** | Patch implementation and automated test coverage. |
| **Release & Disclosure** | Within **14 Days** | Release deployment and coordinated public disclosure. |

---

## 🔒 Automated Security Defenses

- **Static Application Security Testing (SAST)**: CodeQL scans running weekly and on every pull request targeting `main`.
- **Automated Dependency Audits**: Dependabot scans checking Maven and npm dependency vulnerability feeds weekly.
- **Brute-Force Account Protection**: Automatic 15-minute account lockout after 5 failed authentication attempts.
- **Cryptographic Signatures**: Enforced JWT signatures with SHA-256 HMAC encryption and short-lived tokens (24-hour expiration).
- **Double-Entry Ledger Immutability**: Compensating audit entries prevent tampering with historical financial records.
