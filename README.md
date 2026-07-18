# open-icon-libs

Monorepo for open-icon SVG tooling.

## Packages

Core:

1. `open-icon`
   The main Open Icon package with catalog helpers, runtime (lazy) icon lookup, a full static catalog, and per-icon tree-shakable exports.

2. `open-icon-svg`
   Raw SVG asset package that exposes `./icons/*` for direct imports, plus a dependency-free catalog + name-resolution API (`resolveOpenIconName`, `getOpenIconImportPath`, alias maps) via its root and `./catalog` entrypoints.

3. `open-icon-transform`
   A framework-agnostic transformation engine (and CLI) that converts raw SVG content using the open-icon pipeline.

4. `vite-plugin-open-icon`
   A Vite plugin that applies `open-icon-transform` at import time for `*.svg` modules.

Framework wrappers (each ships a lazy runtime component and a full-catalog static component):

5. `vue-open-icon`
6. `react-open-icon`
7. `wc-open-icon` (web component; also ships a zero-bundle CDN element)
8. `ng-open-icon`

Apps (not published):

- `apps/open-icon-api` — Cloudflare Worker serving catalog metadata and on-the-fly SVG/PNG (`api.open-icon.org`).
- `apps/open-icon-org` — the documentation site (`open-icon.org`).

## Pick The Right Package

- `open-icon`: the main icon package with catalog helpers and SVG access.
- `open-icon-svg`: raw packaged SVG files and/or dependency-free catalog + name resolution.
- `open-icon-transform`: direct programmatic SVG transformation (or the CLI) outside Vite.
- `vite-plugin-open-icon`: Vite apps that want transform-at-import behavior.
- `vue-open-icon` / `react-open-icon` / `wc-open-icon` / `ng-open-icon`: drop-in components for your framework.

## Not Including All Icons

The catalog has 1,100+ icons; you rarely want them all in your bundle.

**The important thing to understand:** a *name-based* API (`<Icon name="search"/>`,
`loadIcon('search')`) can never tree-shake — the name is a runtime string, so the
bundler has to keep the whole catalog. Measured, importing `open-icon/runtime`
(which the wrapper `Icon`/runtime components use) pulls **~270 KB of eager catalog
metadata + loader code and emits 1,125 lazy icon chunks**. `open-icon/static`
inlines **~1.7 MB**. Use those only when you deliberately want the whole set.

For a small, fixed set of icons, use one of the **static** paths — each bundles
only the icons you reference (measured: ~1 KB for one icon, zero extra chunks):

- **Tree-shakeable component** — import a per-icon glyph and pass it to `InlineIcon`
  (the wrappers expose it on the `./inline` subpath, and on the main entry too since
  the packages are marked `sideEffects: false`):

  ```tsx
  import { InlineIcon } from 'react-open-icon';        // or 'react-open-icon/inline'
  import { IconUiSearchM } from 'open-icon/icons';
  <InlineIcon icon={IconUiSearchM} title="Search" />
  ```

  (Vue: `vue-open-icon` `InlineIcon`; Angular: `open-icon-inline` /
  `InlineIconComponent`.)

- **Per-icon named exports** — `import { IconUiSearchM } from 'open-icon/icons'` gives
  the raw SVG string directly.

- **Single-file import path** — `getOpenIconImportPath('search')` (from `open-icon-svg`)
  returns `open-icon-svg/icons/ui/search-m.svg` to import one file, optionally through
  `vite-plugin-open-icon`.

Use the name-based runtime `Icon` / `loadIcon()` when you genuinely need
lazy-by-name loading of an unknown-at-build-time icon; use `open-icon/static` /
`Static*` only when you want the entire catalog inlined.

## Monorepo Layout

```text
packages/
  open-icon-transform/   # SVG transform engine + CLI
  open-icon-svg/         # raw SVG assets + catalog/name-resolution API
  open-icon/             # main catalog + runtime/static/per-icon APIs
  vite-plugin-open-icon/ # transform-at-import Vite plugin
  vue-open-icon/         # Vue wrapper
  react-open-icon/       # React wrapper
  wc-open-icon/          # Web-component wrapper (+ CDN element)
  ng-open-icon/          # Angular wrapper
apps/
  open-icon-api/         # Cloudflare Worker API
  open-icon-org/         # documentation website
icons-src/               # authoring source SVGs (transformed into open-icon-svg/icons)
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

- `open-icon-transform` tests validate all transformation steps and combinations, plus the CLI.
- `open-icon` tests validate catalog generation, alias resolution, runtime SVG lookup, and named icon exports.
- `open-icon-svg` tests validate raw asset packaging, catalog metadata, name/alias resolution, and single-icon import paths.
- `vite-plugin-open-icon` tests validate loader behavior and include a real Vite build that asserts unused icons are excluded.
- `vue-open-icon` / `react-open-icon` / `wc-open-icon` / `ng-open-icon` tests validate rendering, accessibility attributes, and runtime/static entrypoint separation.
- `open-icon-api` tests validate resolution, search, pagination, SVG/PNG mutation, and paint-injection safety.

## Publishing

Publishing is automated via `.github/workflows/publish.yml`.

On every push to `master`, the workflow will:

1. bump all package versions (patch)
2. publish `open-icon`
3. publish `vue-open-icon`
4. publish `react-open-icon`
5. publish `wc-open-icon`
6. publish `ng-open-icon`
7. publish `open-icon-transform`
8. publish `open-icon-svg`
9. publish `vite-plugin-open-icon`
10. verify every published version is visible on npm before committing
11. commit the version bump back to `master` with `[skip ci]`

Manual `workflow_dispatch` runs also support a `dry_run` input that builds, tests, writes a GitHub Actions job summary with the exact package versions, bumps versions in the workflow workspace, and validates each package with `npm pack --dry-run` without publishing or pushing a release commit.

Trusted publishing setup required in npm (once per package):

1. Open each package in npm: `open-icon`, `vue-open-icon`, `react-open-icon`, `wc-open-icon`, `ng-open-icon`, `open-icon-transform`, `open-icon-svg`, and `vite-plugin-open-icon`
2. Add a Trusted Publisher for GitHub Actions
3. Set owner/repo to `silvandiepen/open-icon-libs`
4. Set workflow filename to `publish.yml`
5. Set environment to `github-actions` (or update the workflow job environment to match your protected environment)

No `NPM_TOKEN` secret is required with this flow.

Workflow runtime requirement for npm trusted publishing: Node `>=22.14.0` and npm `>=11.5.1`.

Manual fallback:

```bash
npm --workspace open-icon publish
npm --workspace vue-open-icon publish
npm --workspace react-open-icon publish
npm --workspace wc-open-icon publish
npm --workspace ng-open-icon publish
npm --workspace open-icon-transform publish
npm --workspace open-icon-svg publish
npm --workspace vite-plugin-open-icon publish
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development, testing, and release guidelines.
