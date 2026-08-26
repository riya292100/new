# 🛡️ GitHub Branch Protection & Contribution Guardrails

To protect the `main` branch from regressions, enforce code reviews, and guarantee that only passing code gets deployed, configure the following GitHub Branch Protection Rules on [`riya292100/new`](https://github.com/riya292100/new).

---

## ⚙️ How to Configure on GitHub

1. Navigate to your repository: [`https://github.com/riya292100/new`](https://github.com/riya292100/new)
2. Click **Settings** ➔ **Branches** (in the left sidebar).
3. Under **Branch protection rules**, click **Add branch ruleset** or **Add rule**.
4. Set **Branch name pattern**: `main`

---

## 🔒 Recommended Protection Rules

### 1. Require a Pull Request Before Merging
- [x] **Require a pull request before merging**
- [x] **Require approvals**: `1` (or self-approval if solo maintainer)
- [x] **Dismiss stale pull request approvals when new commits are pushed**
- [x] **Require review from Code Owners** (optional)

### 2. Require Status Checks to Pass Before Merging
- [x] **Require status checks to pass before merging**
- [x] **Require branches to be up to date before merging**
- Select the following required status checks from your CI workflow:
  - `Frontend Lint & Code Style`
  - `Frontend Tests & Build`
  - `Backend Tests & Build (Standalone H2)`
  - `Docker Stack Build Validation`
  - `CodeQL Security Analysis`

### 3. Enforce Linear & Clean Commit History
- [x] **Require linear history** (prevents messy merge bubble commits)
- [x] **Do not allow bypassing the above settings**
- [x] **Include administrators**

---

## 🌿 Standard Developer Workflow

```
       (Feature Branch: feat/redis-geo)
main -----------------------------------> [Open PR]
       \                                    |
        \--> [Commit 1] --> [Commit 2] ----> [CI Validates] --> [Squash & Merge] --> main
```

1. Create a scoped branch: `git checkout -b feat/your-feature`
2. Implement feature & tests.
3. Commit using Conventional Commits (`feat: ...`, `fix: ...`).
4. Push to remote: `git push origin feat/your-feature`.
5. Open PR with the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
6. Merge after CI checks pass!
