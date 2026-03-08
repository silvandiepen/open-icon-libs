# open-icon-transform

Framework-agnostic SVG transformation engine used by open-icon tooling.

## Installation

```bash
npm install open-icon-transform
```

## Other Packages In This Repo

- `open-icon-svg`: ships the raw Open Icon SVG files plus typed catalog helpers (names, categories, alias resolution, file/import path lookup).
- `vite-plugin-open-icon`: Vite integration layer that runs this transform engine automatically when importing `.svg?open-icon`.

Use `open-icon-transform` directly when you want full control in scripts, custom build steps, CLIs, or non-Vite runtimes.

## Quick Start

```ts
import { transformOpenIconSvg } from 'open-icon-transform';

const output = transformOpenIconSvg(
  '<svg><path style="fill:red;"/></svg>',
  '/icons/icon_demo.svg'
);
```

## API

### `transformOpenIconSvg(svgContent, filePath, settings?)`

Runs the full transformation pipeline:

1. Optional color simplification (`#hex` -> nearest base color name)
2. Group opacity flattening (`<g style="opacity:...">` -> child style)
3. removeData cleanup (literal + regex)
4. replaceData substitutions
5. removeTags / removeAttributes
6. `{{...}}` variable interpolation

### `openIconSvgLoaderDefaults`

Default pipeline settings mirrored from open-icon build config.

### Types

- `OpenIconSvgLoaderSettings`
- `OpenIconReplaceDataEntry`
- `OpenIconSvgMeta`

## Settings Reference

| Key | Type | Description |
|---|---|---|
| `query` | `string` | Shared compatibility key (used by loader wrappers) |
| `replaceName` | `string \| string[]` | Prefixes/fragments removed from source filename before metadata derivation |
| `replaceData` | `[string\|string[], string][]` | Literal replacement rules |
| `removeData` | `string \| string[]` | Literal or regex patterns (regex as `/.../`) removed from SVG |
| `removeTags` | `string \| string[]` | Element tags removed from output |
| `removeAttributes` | `string \| string[]` | Attributes removed from output |
| `simplifyColors` | `boolean` | Enables color simplification |
| `default` | `object` | Defaults used in interpolation templates |
| `configData` | `Record<string, unknown>` | Custom interpolation values |

## Variable Interpolation

Placeholders are supported in replacement strings:

- `{{componentName}}`
- `{{fileName}}`
- `{{default.iconFill}}`
- custom values like `{{brand.primary}}` from `configData`

## Example: Custom Brand Color Variable

```ts
transformOpenIconSvg(svg, '/icons/icon_button.svg', {
  replaceData: [['fill:red;', 'fill: {{brand.primary}};']],
  configData: { brand: { primary: '#123456' } },
  simplifyColors: false,
  removeData: [],
});
```

## Testing

```bash
npm test
```

Tests cover individual transforms and combined transformation scenarios.
