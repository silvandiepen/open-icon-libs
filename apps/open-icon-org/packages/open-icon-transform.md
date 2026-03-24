---
title: open-icon-transform
description: The framework-agnostic transformation engine used by the Open Icon toolchain.
order: 2
---

# open-icon-transform

`open-icon-transform` is the pipeline layer. It accepts raw SVG content and applies the same cleanup and interpolation steps used by the loader integrations.

## Install

```bash
npm install open-icon-transform
```

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

- `open-icon-svg` for typed names and file lookup metadata
- your own scripts, CLIs, or build steps when Vite is not involved
