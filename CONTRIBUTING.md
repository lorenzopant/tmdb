# Contributing to @lorenzopant/tmdb

Thank you for considering contributing to **@lorenzopant/tmdb**! Whether it's bug reports, feature requests, documentation improvements, or code contributions — all help is appreciated 🙌

---

## 🧰 Getting Started

1. Fork the repository and clone it locally.
2. Install dependencies:

    ```bash
    pnpm install
    ```

    Git hooks are installed from the repo root via Lefthook during install.
    If you need to reinstall them manually, run:

    ```bash
    pnpm exec lefthook install
    ```

3. Run the development server and test suite:

    ```bash
    pnpm dev
    pnpm test
    ```

---

## 🧪 Running Tests

We use [Vitest](https://vitest.dev/) for testing.

Recommended root-level test commands:

```bash
pnpm test
pnpm test:unit
pnpm test:watch
pnpm test:ui
pnpm test:coverage
```

What each command does:

- `pnpm test` runs the default unit test suite
- `pnpm test:unit` runs all unit tests across the workspace
- `pnpm test:watch` starts Vitest in watch mode for `packages/tmdb`
- `pnpm test:ui` starts the Vitest UI for `packages/tmdb`
- `pnpm test:coverage` runs the unit suite with coverage reporting

Integration tests require TMDB credentials and can be run separately with:

```bash
pnpm test:integration
```

If you want to run the package tests directly instead of using the root shortcuts:

```bash
cd packages/tmdb
pnpm run test
pnpm run test:watch
pnpm run test:ui
```

---

## ✍️ Code Style

- Use **TypeScript**
- Use **named exports** where possible
- Follow the established file structure (`src/`, `types/`, `tests/`, etc.)
- Use `pnpm lint` and `pnpm format` before submitting a PR
- Use `pnpm check` before pushing changes when you want the same core validation locally
- Pre-commit hooks format and lint staged files before the commit is created
- Pre-push hooks run lint, typecheck, build, and unit tests across the repo
- If `TMDB_BEARER_TOKEN` is set locally, pre-push also runs integration tests
- You can override hooks locally with `lefthook-local.yml` or `lefthook-local.yaml`

---

## 🧩 Submitting a Pull Request

1. Create a new branch from `main`
2. Follow the PR template if available
3. Provide a clear description of what you changed and why
4. Include related issue numbers if applicable
5. Ensure all tests pass and types are correct

---

## 🗃 Feature Requests & Bugs

- Open an issue describing the problem or idea
- Provide examples if possible (stack traces, API request/response, etc.)

---

## 🙌 Thank You

You're helping improve the developer experience for people building with the TMDB API in TypeScript. Thank you for your contributions!
