# open-icon-libs — Repository Audit

A full audit of the monorepo covering the core packages, framework wrappers,
build tooling, the API worker, and the documentation site. It records what was
found, what this branch fixes, and the prioritized work that remains.

Baseline at audit time: all packages build and **122 unit tests pass**; the only
build that cannot run in a sandboxed CI is the docs site's static generation,
which shells out to `girky` (a network + native-binary dependency).

---

## 1. Not including all icons (selective loading)

**Finding.** The catalog has 1,100+ icons. The building blocks for shipping only
what you use existed but were under-surfaced or subtly broken:

- `open-icon/icons` already exposes per-icon named exports (tree-shakeable).
- `open-icon/runtime` + `loadIcon()` lazy-load icons as separate chunks.
- `open-icon-svg`'s `src/index.ts` contained a complete name→file resolver
  (`resolveOpenIconName`, `getOpenIconImportPath`) — but it was **never
  published** (absent from `exports`/`files`), **never imported**, its
  `typecheck` script ran no `tsc`, and its committed catalog had drifted from the
  real icon set, so `getOpenIconImportPath` returned wrong paths.

**Fixed on this branch.**

- `open-icon-svg` now publishes its catalog + resolution API (`.` and `./catalog`
  exports, `dist` in `files`), so `getOpenIconImportPath('search')` →
  `open-icon-svg/icons/ui/search-m.svg` is a real, dependency-free primitive for
  importing exactly one icon.
- Catalog generation is wired into `build`/`typecheck` so it can no longer drift;
  `typecheck` runs real `tsc`.
- `vite-plugin-open-icon` gained an end-to-end **Vite build test** proving that
  importing one icon via `?open-icon` excludes un-imported icons from the output.
- The root README documents the three tree-shakeable paths.

**Remaining.** No wrapper exposes a per-icon *component* API built on the
`open-icon/icons` named exports; the wrappers' runtime path also always bundles
the full catalog metadata maps via `export * from 'open-icon/runtime'`. A
future improvement is a per-icon component (e.g. `<Icon glyph={IconUiSearchM}/>`)
and slimming the always-bundled runtime metadata.

## 2. Consts / types cleanup & reducing double work

**Fixed.**

- Removed the dead/duplicated catalog path in `open-icon-svg` by making it a
  real, published, tested surface instead of unpublished dead code.
- Deduplicated `walkSvgFiles` (svg `validate-package.mjs` now reuses the shared
  helper), the Angular static markup/resolve helpers (single implementation,
  re-exported), and the web-component `escapeAttribute` + markup builders
  (extracted to `wc-open-icon/src/markup.ts`).

**Remaining (documented, not yet changed).**

- The name-normalization helpers (`normalizeSegment`/`normalizePath`/
  `stripIconPrefix`) exist in three places: `openIconCatalog.mjs` (build script,
  the source of truth), `open-icon-svg/src/index.ts`, and `open-icon/runtime.ts`.
  They are byte-identical and can drift. Consider generating the runtime resolver
  from the same builder, or having `open-icon` re-export `open-icon-svg`'s
  resolver instead of maintaining its own copy.
- The name types in every wrapper widen to `| string`, which disables literal
  autocompletion/typo-catching from `OpenIconKey`/`OpenIconName`.

## 3. Aliases

**Finding.** Only 6 custom semantic aliases existed.

**Fixed.** Expanded to ~90 verified aliases (`search`, `close`, `trash`,
`download`, `user`, `settings`, arrow/chevron directions, media playback, theme,
etc.) in `openIconCustomAliases.mjs`. Every target is validated against the
catalog at build time and asserted by the `open-icon-svg` tests, so an alias can
never silently point at a missing icon. Aliases that would have shadowed a real
icon were dropped in favour of the real icon (e.g. `world` → `ui/world`).

## 4. Transform engine & plugins

**Fixed.**

- `isRegex` now treats only `/.../`-delimited patterns as regex, so literal
  `removeData` patterns containing metacharacters match literally (the
  literal-escaping branch was previously unreachable).
- The `fill:black` rule now also matches the unspaced form that `simplifyColors`
  produces (`#000000` → `black`), so black fills map to a variable.
- The CLI `--help` exits `0` to stdout; parse errors exit `1` to stderr.
- Regenerated 38 committed icons whose `fill: red` style blocks predated the
  earlier fill:red fix (they had drifted from what the transform produces).

**Remaining.**

- `simplifyColors` snaps *every* hex to one of 20 base colors — lossy for
  genuine colored SVGs run through the CLI (intended for the open-icon authoring
  convention; worth a documented `--no-simplify-colors` guard).
- Attribute-form colors (`fill="red"`) are not converted, only style-declaration
  forms.
- `baseColors.lime` (`#00ff00`) is unreachable (duplicate of `green`); the names
  `green`/`lime` also don't match their CSS values (`green` should be `#008000`).
  Left as-is to avoid changing color snapping for existing icons.

## 5. Framework wrappers

**Fixed.**

- **Angular** `IconComponent`/`StaticIconComponent` now accept an `aria-label`
  input and forward it (previously hard-coded to `null`, so Angular was the only
  wrapper that dropped `aria-label` — a cross-framework a11y gap).
- **Web component** static/SSR markup now carries the same `part="icon"` hook and
  renders at `1em` (svg sized inline) to match the runtime element, instead of
  rendering at the raw viewBox size.

**Remaining.**

- Inconsistent element-tag prop across frameworks (Vue `tag`, React `as`, WC/NG
  fixed `<span>`); no `size`/`color` prop anywhere despite the SVGs being authored
  against CSS custom properties.
- React/Angular runtime components render empty on first paint/SSR unless the
  icon is preloaded (Vue handles SSR correctly via `onServerPrefetch`).

## 6. API worker (`apps/open-icon-api`)

**Fixed (security).**

- **Reflected XSS**: `color`/`fill`/`stroke`/`opacity`/`strokeWidth` query params
  were injected unescaped into an `image/svg+xml` response, so
  `?color="><script>…` executed in the API origin. Paint values are now
  whitelisted (hex/rgb/hsl/named/currentColor/transparent/var()) and numeric
  values validated; unsafe values are rejected. Regression tests added.
- `POST /v1/icons/search` now returns `400` on a malformed JSON body instead of
  crashing the worker with an unhandled rejection.

**Remaining.**

- `HEAD` requests return `405`; the undocumented `/_asset/*` passthrough bypasses
  name resolution; API and site use two divergent search normalizations.

## 7. Documentation site (`apps/open-icon-org`)

**Fixed.**

- Removed the stale, git-tracked root `public/` build (built from the wrong root,
  inert JS, broken nav) and gitignored it; deploy uses `apps/open-icon-org/public`.

**Remaining (could not be built in-sandbox — `girky` needs network + native
binaries; these are the main "bring the site up to standard" items).**

- **Performance**: the icon grid renders all ~1,100 icons eagerly and fires
  ~1,100 concurrent `fetch()`es (`open-icon-gallery.ts`, `inline-icon.ts`), and
  rebuilds the whole grid on every keystroke with no debounce. Recommend
  pagination/virtualization + debounced search + `IntersectionObserver` lazy
  hydration (or the paged API).
- **SEO/social**: generated `<head>` has no `og:`/`twitter:`/canonical/JSON-LD,
  and there is no `sitemap.xml` (robots.txt has no `Sitemap:`).
- **Content**: `about/release-notes.md` is a stale duplicate of the generated
  `release-notes/` index; the floating render-controls mount on every page.
- Duplicated card markup between the gallery and icon-detail; `getGalleryIconPreviewUrl`
  has a vestigial `settings` param.

## 8. Build / release / CI

**Fixed.**

- Added `.github/workflows/ci.yml` running typecheck + tests on `pull_request`
  and non-master pushes (previously validation only ran during publish on master).
- Pinned the site generator to `girky@1.18.0` (script + devDependency + lockfile)
  for deterministic site builds.
- README/CONTRIBUTING corrected (all 8 packages + 2 apps documented; Node/npm
  prerequisites fixed to 22.14+/11.5+).

**Remaining.**

- The lockfile still carries a ghost `packages/open-icon-vue` block (the old name
  of `vue-open-icon`); regenerate the lockfile to prune it.
- Shared-version publishing is anchored solely to `open-icon-transform`'s local
  `package.json`; the 7 shared packages are never cross-checked against npm.
- CI Node versions differ (`publish.yml` 22.14 vs `deploy-cloudflare.yml` 25).
- The committed generated `open-icon-svg/icons/` tree (and api assets) can still
  drift from `icons-src/`; consider gitignoring generated assets and generating
  them in CI, or adding a "regeneration produces no diff" CI check.
