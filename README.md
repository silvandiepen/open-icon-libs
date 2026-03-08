# open-icon-libs

Monorepo for open-icon SVG tooling.

## Packages

1. `open-icon-transform`
   A framework-agnostic transformation engine that converts raw SVG content using the open-icon pipeline.

2. `open-icon-svg`
   SVG asset package with generated icon names, categories, aliases, and path lookup helpers.

3. `vite-plugin-open-icon`
   A Vite plugin wrapper that applies `open-icon-transform` at import time for `*.svg` modules.

## Pick The Right Package

- `open-icon-svg`: choose this when you need icon files + typed catalog metadata (lookup, aliases, categories).
- `open-icon-transform`: choose this when you need direct programmatic SVG transformation outside Vite.
- `vite-plugin-open-icon`: choose this when your app uses Vite and you want transform-at-import behavior.

Most projects combine packages:

- `open-icon-svg` + `vite-plugin-open-icon` for Vite apps with typed icon selection.
- `open-icon-svg` + `open-icon-transform` for scripts/CLIs/server pipelines.
- `vite-plugin-open-icon` alone if you only need transform behavior on local SVG imports.

## Monorepo Layout

```text
packages/
  open-icon-transform/
    src/
    test/
  open-icon-svg/
    icons/
    src/
    test/
  vite-plugin-open-icon/
    src/
    test/
```

## Why Split It This Way

- You can use transforms independently in scripts, CLIs, Node services, or other bundlers.
- SVG source data and typed lookup metadata are versioned in a standalone package.
- The Vite plugin stays minimal and focused on Vite lifecycle integration.

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

- `open-icon-transform` tests validate all transformation steps and combinations.
- `open-icon-svg` tests validate catalog generation, alias resolution, and import path helpers.
- `vite-plugin-open-icon` tests validate loader behavior and transformer integration.

## Publishing

Publishing is automated via `.github/workflows/publish.yml`.

On every push to `master`, the workflow will:

1. bump all package versions (patch)
2. publish `open-icon-transform`
3. publish `open-icon-svg`
4. publish `vite-plugin-open-icon`
5. commit the version bump back to `master` with `[skip ci]`

Trusted publishing setup required in npm (once per package):

1. Open each package in npm: `open-icon-transform`, `open-icon-svg`, and `vite-plugin-open-icon`
2. Add a Trusted Publisher for GitHub Actions
3. Set owner/repo to `silvandiepen/open-icon-libs`
4. Set workflow filename to `publish.yml`
5. Set environment to `github-actions` (or your chosen protected environment if used)

No `NPM_TOKEN` secret is required with this flow.

Workflow runtime requirement for npm trusted publishing: Node `>=22.14.0` and npm `>=11.5.1`.

Manual fallback:

```bash
npm --workspace open-icon-transform publish
npm --workspace open-icon-svg publish
npm --workspace vite-plugin-open-icon publish
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development, testing, and release guidelines.
