# Contributing

## Prerequisites

- Node.js 20+
- npm 10+

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
  - Framework-agnostic transformation logic only.
  - No Vite-specific behavior.
- `vite-plugin-open-icon`
  - Vite integration only.
  - Delegates SVG conversion to `open-icon-transform`.

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
