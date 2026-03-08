# open-icon-svg

Typed Open Icon catalog + raw SVG files in one package.

`open-icon-svg` gives you a stable icon data layer for apps and tooling:

- `1,131` SVG files shipped with the package
- `12` categories with typed names and lookups
- resilient input resolution (`icon_*`, file paths, `.svg`, spaced names)
- direct file/import path helpers for rendering pipelines

## Install

```bash
npm install open-icon-svg
```

## Other Packages In This Repo

- `open-icon-transform`: framework-agnostic SVG transformation engine for scripts, CLIs, and custom pipelines.
- `vite-plugin-open-icon`: Vite plugin that applies the transform pipeline automatically at import time.

Use `open-icon-svg` as the source of truth for icon names/files, then pair it with one of the packages above depending on your runtime.

## Why Use This Package

Use `open-icon-svg` when you need one source of truth for icon names and files:

- build icon pickers with typed categories
- normalize user or CMS icon input before rendering
- resolve canonical names to packaged SVG paths
- feed icon metadata into your own loaders, scripts, or design tooling

## Quick Start

```ts
import {
  OPEN_ICON_NAMES,
  OPEN_ICON_CATEGORIES,
  OPEN_ICON_CATEGORY_TO_NAMES,
  OPEN_ICON_KEY_TO_NAME,
  resolveOpenIconName,
  getOpenIconFilePath,
  getOpenIconImportPath,
  isOpenIconName,
} from 'open-icon-svg';

// Typed, canonical icon names
const iconName = OPEN_ICON_KEY_TO_NAME.UI_SEARCH_M; // "ui/search-m"

// Resolve many input shapes to canonical names
resolveOpenIconName('ui/icon_search-m.svg'); // "ui/search-m"
resolveOpenIconName('icon_chevron-down'); // "arrows/chevron-down"
resolveOpenIconName('wayfinding/check in'); // "wayfinding/check-in"

// Convert canonical or loose input to file/import paths
getOpenIconFilePath('wayfinding/check-in');
// "icons/wayfinding/icon_check in.svg"

getOpenIconImportPath('wayfinding/check-in');
// "open-icon-svg/icons/wayfinding/icon_check%20in.svg"

// Runtime guard for unknown values
if (isOpenIconName(iconName)) {
  // iconName is now narrowed to OpenIconName
}

// Browse icons by category
const uiIcons = OPEN_ICON_CATEGORY_TO_NAMES.ui;
```

## Exports

| Export | Purpose |
|---|---|
| `OPEN_ICON_NAMES` | full typed list of canonical names (`"ui/search-m"`) |
| `OPEN_ICON_CATEGORIES` | typed category list |
| `OPEN_ICON_CATEGORY_TO_NAMES` | map category -> canonical icon names |
| `OPEN_ICON_KEY_TO_NAME` | constant-like key map (`UI_SEARCH_M`) -> canonical name |
| `OPEN_ICON_NAME_TO_FILE` | canonical name -> packaged SVG file path |
| `OPEN_ICON_ALIAS_TO_NAME` | normalized aliases -> canonical names |
| `resolveOpenIconName(value)` | normalize dynamic input to canonical `OpenIconName` |
| `getOpenIconFilePath(value)` | resolve to `icons/...svg` path |
| `getOpenIconImportPath(value)` | resolve to URI-safe package import path |
| `isOpenIconName(value)` | runtime type guard for canonical names |
| `OpenIconName` / `OpenIconCategory` | generated TypeScript types |

### Advanced: direct catalog module

If you only need generated catalog constants/types, you can import from the explicit subpath:

```ts
import { OPEN_ICON_NAMES, OPEN_ICON_KEY_TO_NAME } from 'open-icon-svg/catalog';
```

## Works Well With

### `vite-plugin-open-icon`

Use this package for catalog + path resolution, and let the Vite plugin transform loaded SVG modules:

```bash
npm install open-icon-svg vite-plugin-open-icon
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { openIconSvgLoaderPlugin } from 'vite-plugin-open-icon';

export default defineConfig({
  plugins: [openIconSvgLoaderPlugin()],
});
```

```ts
// anywhere in app code
import searchIcon from 'open-icon-svg/icons/ui/icon_search-m.svg?open-icon';
```

### `open-icon-transform`

Use this package as the metadata/catalog source, and `open-icon-transform` for custom SVG transformation pipelines:

```bash
npm install open-icon-svg open-icon-transform
```

## Catalog Snapshot

Current catalog distribution:

- `ui`: 571
- `arrows`: 167
- `misc`: 129
- `wayfinding`: 81
- `media`: 58
- `special-characters`: 43
- `weather`: 19
- `animals`: 17
- `product`: 17
- `food-drinks`: 15
- `shopping`: 10
- `sports`: 4

## Icon Files

Raw SVG files are published and importable under:

- `open-icon-svg/icons/*`

Example path from this package:

- `open-icon-svg/icons/ui/icon_search-m.svg`

## Generate, Build, Test

```bash
npm --workspace open-icon-svg run generate
npm --workspace open-icon-svg run build
npm --workspace open-icon-svg run test
```

Generator output:

- `src/generated/openIconCatalog.generated.ts`

## License

MIT
