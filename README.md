# open-icon-libs

Monorepo for open-icon SVG tooling.

## Packages

1. `open-icon-transform`
   A framework-agnostic transformation engine that converts raw SVG content using the open-icon pipeline.

2. `vite-plugin-open-icon`
   A Vite plugin wrapper that applies `open-icon-transform` at import time for `*.svg` modules.

## Monorepo Layout

```text
packages/
  open-icon-transform/
    src/
    test/
  vite-plugin-open-icon/
    src/
    test/
```

## Why Split It This Way

- You can use transforms independently in scripts, CLIs, Node services, or other bundlers.
- The Vite plugin stays minimal and focused on Vite lifecycle integration.
- Shared behavior is tested once in `open-icon-transform`, with plugin integration tested separately.

## Workspace Scripts

From repo root:

```bash
npm install
npm run build
npm run test
npm run typecheck
npm run clean
```

## Test Coverage Strategy

- `open-icon-transform` tests validate all transformation steps and combinations:
  - removeData (literal + regex)
  - replaceData variants
  - simplifyColors on/off
  - group opacity flattening
  - removeTags + removeAttributes
  - variable interpolation from defaults + configData
  - full pipeline multi-step case
- `vite-plugin-open-icon` tests validate loader behavior:
  - query filtering
  - non-svg skip behavior
  - custom query support
  - encoded path handling
  - custom settings passthrough
  - plugin output parity with direct transformer

## Publishing

Publish per package:

```bash
npm --workspace open-icon-transform publish
npm --workspace vite-plugin-open-icon publish
```
