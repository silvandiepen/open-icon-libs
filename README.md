# open-icon-libs

Monorepo for open-icon SVG tooling.

## Packages

1. `open-icon`
   The main Open Icon package with catalog helpers, runtime icon lookup, and tree-shakable icon exports.

2. `open-icon-svg`
   Raw SVG asset package that exposes `./icons/*` for direct imports.

3. `open-icon-transform`
   A framework-agnostic transformation engine that converts raw SVG content using the open-icon pipeline.

4. `vite-plugin-open-icon`
   A Vite plugin wrapper that applies `open-icon-transform` at import time for `*.svg` modules.

## Pick The Right Package

- `open-icon`: choose this when you want the main icon package with catalog helpers and SVG access.
- `open-icon-svg`: choose this when you only need raw packaged SVG files.
- `open-icon-transform`: choose this when you need direct programmatic SVG transformation outside Vite.
- `vite-plugin-open-icon`: choose this when your app uses Vite and you want transform-at-import behavior.

Most projects combine packages:

- `open-icon` + `vite-plugin-open-icon` for app-facing icon selection plus Vite transforms.
- `open-icon-svg` + `vite-plugin-open-icon` for direct file imports that still want transform-at-import behavior.
- `vite-plugin-open-icon` alone if you only need transform behavior on local SVG imports.

## Monorepo Layout

```text
packages/
  open-icon-transform/
    src/
    test/
  open-icon/
    src/
    test/
  open-icon-svg/
    icons/
    test/
  vite-plugin-open-icon/
    src/
    test/
```

## Why Split It This Way

- You can use transforms independently in scripts, CLIs, Node services, or other bundlers.
- The main app-facing API lives in `open-icon`.
- Raw SVG source data stays isolated in `open-icon-svg`.
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
- `open-icon` tests validate catalog generation, alias resolution, runtime SVG lookup, and named icon exports.
- `open-icon-svg` tests validate raw asset packaging.
- `vite-plugin-open-icon` tests validate loader behavior and transformer integration.

## Publishing

Publishing is automated via `.github/workflows/publish.yml`.

On every push to `master`, the workflow will:

1. bump all package versions (patch)
2. publish `open-icon-svg`
3. publish `open-icon`
4. publish `open-icon-transform`
5. publish `vite-plugin-open-icon`
5. commit the version bump back to `master` with `[skip ci]`

Trusted publishing setup required in npm (once per package):

1. Open each package in npm: `open-icon`, `open-icon-svg`, `open-icon-transform`, and `vite-plugin-open-icon`
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
npm --workspace open-icon publish
npm --workspace vite-plugin-open-icon publish
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development, testing, and release guidelines.
