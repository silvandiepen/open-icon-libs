---
title: vite-plugin-open-icon
description: The Vite integration layer that runs the Open Icon transform pipeline at import time.
order: 8
---

# vite-plugin-open-icon

`vite-plugin-open-icon` connects the transformation pipeline to Vite. It transforms `.svg` modules when the configured query is present and returns a JavaScript module with the transformed SVG string.

## Install

```bash
npm install vite-plugin-open-icon
```

## Use it when

- your app already uses Vite
- you want transformed SVG output at module load time
- you want to keep custom transform settings in Vite config instead of bespoke scripts

## Example

```ts
import { defineConfig } from 'vite';
import { openIconSvgLoaderPlugin } from 'vite-plugin-open-icon';

export default defineConfig({
  plugins: [
    openIconSvgLoaderPlugin({
      query: 'open-icon',
    }),
  ],
});
```

```ts
import searchIcon from 'open-icon-svg/icons/ui/icon_search-m.svg?open-icon';
```

## Pair it with

- `open-icon` when you want the main icon package alongside Vite transforms
- `open-icon-svg` when you want direct package-based SVG imports
- `open-icon-transform` when you also need to reuse the same transform logic in non-Vite contexts
