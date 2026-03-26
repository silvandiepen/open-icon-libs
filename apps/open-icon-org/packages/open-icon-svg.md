---
title: open-icon-svg
description: The raw SVG asset package for Open Icon.
order: 6
---

# open-icon-svg

`open-icon-svg` is the raw asset package in this repo. It exists for direct SVG imports and for tooling that wants the original files without the main catalog/helper layer.

## Install

```bash
npm install open-icon-svg
```

## Use it when

- you want to import raw SVG files directly
- you use `vite-plugin-open-icon` on packaged SVG files
- you need the original file layout as published assets

## What it exports

- `./icons/*` for direct SVG asset imports
- `./package.json` for package metadata access

## Example

```ts
import searchIconUrl from 'open-icon-svg/icons/ui/icon_search-m.svg';
import checkInIconUrl from 'open-icon-svg/icons/wayfinding/icon_check%20in.svg';
```

## Pair it with

- `open-icon` when you also need catalog helpers and runtime lookup
- `vite-plugin-open-icon` for Vite apps that import SVG modules
