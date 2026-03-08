# open-icon-svg

SVG source package for Open Icon assets with generated names, types, and lookup tables.

## What it exports

- `OPEN_ICON_NAMES`: canonical icon names like `ui/search-m`
- `OPEN_ICON_CATEGORIES`: categories like `ui`, `arrows`, `weather`
- `OPEN_ICON_KEY_TO_NAME`: constant-style keys to canonical names
- `OPEN_ICON_NAME_TO_FILE`: canonical name -> packaged SVG file path
- `OPEN_ICON_CATEGORY_TO_NAMES`: category -> icon names
- `OPEN_ICON_ALIAS_TO_NAME`: normalized aliases -> canonical names
- `resolveOpenIconName(value)`: resolves dynamic user input to canonical icon names
- `getOpenIconFilePath(value)`: resolves to `icons/...svg`
- `getOpenIconImportPath(value)`: resolves to URI-safe package import path

## Generation

Catalog data is generated from `icons/**/*.svg`.

```bash
npm --workspace open-icon-svg run generate
```

The generator writes:

- `src/generated/openIconCatalog.generated.ts`

## Build and test

```bash
npm --workspace open-icon-svg run build
npm --workspace open-icon-svg run test
```

## Notes

- Canonical names are normalized (`icon_` prefix stripped, spaces/special chars normalized).
- Raw SVG files are shipped under `open-icon-svg/icons/*`.
