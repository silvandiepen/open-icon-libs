---
title: open-icon-transform
description: The framework-agnostic transformation engine used by the Open Icon toolchain.
order: 7
---

# open-icon-transform

`open-icon-transform` is the pipeline layer. It accepts raw SVG content and applies the same cleanup and interpolation steps used by the loader integrations.

If you want the actual Open Icon authoring rules, semantic color mappings, and source SVG conventions, read the [Icon Authoring Guide](/about/authoring/).

## Install

```bash
npm install open-icon-transform
```

## CLI

```bash
npx open-icon-transform@latest src/my-icon.svg --output dist/my-icon-transformed.svg
```

Directory input also works recursively:

```bash
npx open-icon-transform@latest src/icons --output dist/icons
```

Use first-class flags for the common transform settings:

```bash
npx open-icon-transform@latest src/my-icon.svg --default-icon-fill '#123456' --default-icon-stroke-width 6 --remove-tag title --output dist/my-icon.svg
```

Available first-class flags:

- `--simplify-colors`
- `--no-simplify-colors`
- `--replace-name <value>`
- `--remove-data <value>`
- `--remove-tag <tag>`
- `--remove-attribute <attribute>`
- `--default-icon-fill <value>`
- `--default-icon-fill-opacity <value>`
- `--default-icon-stroke-width <value>`
- `--default-icon-stroke-linecap <value>`
- `--default-icon-stroke-linejoin <value>`

Load settings from a config file for the full nested transform surface:

```bash
npx open-icon-transform@latest src/my-icon.svg --config open-icon-transform.config.json --output dist/my-icon.svg
```

Or pass advanced settings inline as JSON:

```bash
npx open-icon-transform@latest src/my-icon.svg --settings '{"default":{"iconFill":"#123456"},"simplifyColors":false}' --output dist/my-icon.svg
```

Precedence is: first-class flags, then `--settings`, then `--config`.

## Use it when

- you need SVG transformation in scripts or CLIs
- you want to run the Open Icon pipeline outside Vite
- you need direct access to replace/remove rules and interpolation settings

## What it handles

- color simplification
- opacity flattening
- data cleanup and replacement
- tag and attribute removal
- `{{...}}` interpolation using defaults and custom config data

## Example

```ts
import { transformOpenIconSvg } from 'open-icon-transform';

const output = transformOpenIconSvg(
  '<svg><path style="fill:red;"/></svg>',
  '/icons/icon_demo.svg',
  {
    replaceData: [['fill:red;', 'fill: {{brand.primary}};']],
    configData: { brand: { primary: '#123456' } },
    simplifyColors: false,
    removeData: [],
  }
);
```

## Pair it with

- `open-icon` for typed names and runtime icon lookup
- `open-icon-svg` for direct raw SVG imports
- your own scripts, CLIs, or build steps when Vite is not involved
