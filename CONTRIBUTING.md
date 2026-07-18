# Contributing

## Prerequisites

- Node.js `>=22.14.0` (matches the app `engines` and the publish workflow)
- npm `>=11.5.1` (required for npm trusted publishing)

## Setup

```bash
npm install
```

## Workspace Commands

Run from monorepo root:

```bash
npm run build
npm run typecheck
npm run test
```

## Package Responsibilities

- `open-icon-transform`
  - Framework-agnostic transformation logic and CLI only.
  - No Vite-specific behavior.
- `open-icon-svg`
  - Raw SVG assets (generated from `icons-src/`) plus the dependency-free catalog + name-resolution API.
  - Icon and catalog generation is wired into `build`; do not hand-edit generated files.
- `open-icon`
  - Main catalog + runtime (lazy), static (full), and per-icon tree-shakable APIs.
- `vite-plugin-open-icon`
  - Vite integration only. Delegates SVG conversion to `open-icon-transform`.
- `vue-open-icon` / `react-open-icon` / `wc-open-icon` / `ng-open-icon`
  - Thin framework wrappers over `open-icon/runtime` (lazy) and `open-icon/static` (full).
  - Keep the runtime and static entrypoints separate so the runtime path never pulls in the full catalog.

Icon aliases (short semantic names like `search`, `close`, `trash`) live in
`packages/open-icon-svg/scripts/openIconCustomAliases.mjs`. Every alias target is
validated against the catalog by the `open-icon-svg` tests.

## Testing Requirements

Every change must include tests for:

1. Direct transform behavior (`packages/open-icon-transform/test`)
2. Plugin integration behavior (`packages/vite-plugin-open-icon/test`) when plugin-related
3. Combination scenarios when adding/changing pipeline steps

## Documentation Requirements

Update docs when behavior or API changes:

- Root `README.md` for architecture/workspace changes
- Package `README.md` for API and usage changes

## Release Notes

When publishing:

1. Update package version(s)
2. Run build, typecheck, and tests
3. Publish target package(s)
