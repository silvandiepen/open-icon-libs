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

If you want your own SVGs to behave like Open Icon source icons, follow the icon authoring rules documented on the docs site:

- https://open-icon.org/icons/authoring/

## Quick Start

```ts
import { transformOpenIconSvg } from 'open-icon-transform';

const output = transformOpenIconSvg(
  '<svg><path style="fill:red;"/></svg>',
  '/icons/icon_demo.svg'
);
```

## CLI

Transform a file directly from the command line:

```bash
npx open-icon-transform@latest src/my-icon.svg --output dist/my-icon-transformed.svg
```

Transform a folder recursively while preserving relative paths:

```bash
npx open-icon-transform@latest src/icons --output dist/icons
```

If the package is already installed in the project, the bin alias also works:

```bash
npx open-icon-transformer src/my-icon.svg --output dist/my-icon-transformed.svg
```

Without `--output`, the transformed SVG is written to stdout.
Directory input requires `--output`.

### First-class CLI flags

Use dedicated flags for the common transform settings:

```bash
npx open-icon-transform@latest src/my-icon.svg \
  --default-icon-fill '#123456' \
  --default-icon-stroke-width 6 \
  --remove-tag title \
  --remove-attribute data-name \
  --output dist/my-icon.svg
```

Available first-class flags:

| Flag | Repeatable | Maps to |
|---|---|---|
| `--simplify-colors` | no | `simplifyColors: true` |
| `--no-simplify-colors` | no | `simplifyColors: false` |
| `--replace-name <value>` | yes | `replaceName` |
| `--remove-data <value>` | yes | `removeData` |
| `--remove-tag <tag>` | yes | `removeTags` |
| `--remove-attribute <attribute>` | yes | `removeAttributes` |
| `--default-icon-fill <value>` | no | `default.iconFill` |
| `--default-icon-fill-opacity <value>` | no | `default.iconFillOpacity` |
| `--default-icon-stroke-width <value>` | no | `default.iconStrokeWidth` |
| `--default-icon-stroke-linecap <value>` | no | `default.iconStrokeLinecap` |
| `--default-icon-stroke-linejoin <value>` | no | `default.iconStrokeLinejoin` |

### CLI config file

Load transform settings from a JSON or JS config file when you need the full surface, such as `replaceData` or `configData`:

```bash
npx open-icon-transform@latest src/my-icon.svg --config open-icon-transform.config.json --output dist/my-icon.svg
```

```json
{
  "default": {
    "iconFill": "#123456"
  },
  "simplifyColors": true,
  "removeData": ["/<\\?xml.*?\\?>/", "/<!--.*?-->/"]
}
```

### CLI inline settings

Pass any transform settings inline as JSON for advanced one-off runs:

```bash
npx open-icon-transform@latest src/my-icon.svg \
  --settings '{"default":{"iconFill":"#123456"},"simplifyColors":false}' \
  --output dist/my-icon.svg
```

### CLI precedence

When more than one config source is provided, precedence is:

1. first-class CLI flags
2. `--settings` inline JSON
3. `--config` file

That means dedicated flags are the primary interface, while config files and inline JSON remain available for advanced nested settings.

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
