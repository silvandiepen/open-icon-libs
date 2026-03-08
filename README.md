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

Publishing is automated via `.github/workflows/publish.yml`.

On every push to `master`, the workflow will:

1. bump both package versions (patch)
2. publish `open-icon-transform`
3. publish `vite-plugin-open-icon`
4. commit the version bump back to `master` with `[skip ci]`

Trusted publishing setup required in npm (once per package):

1. Open each package in npm: `open-icon-transform` and `vite-plugin-open-icon`
2. Add a Trusted Publisher for GitHub Actions
3. Set owner/repo to `silvandiepen/open-icon-libs`
4. Set workflow filename to `publish.yml`
5. Set environment to `github-actions` (or your chosen protected environment if used)

No `NPM_TOKEN` secret is required with this flow.

Manual fallback:

```bash
npm --workspace open-icon-transform publish
npm --workspace vite-plugin-open-icon publish
```


## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development, testing, and release guidelines.
