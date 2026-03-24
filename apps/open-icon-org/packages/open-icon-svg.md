---
title: open-icon-svg
description: The typed catalog and raw SVG package for Open Icon.
order: 1
---

# open-icon-svg

`open-icon-svg` is the source-of-truth package in this repo. It ships the raw SVG files together with generated names, category maps, aliases, and file/import helpers.

## Install

```bash
npm install open-icon-svg
```

## Use it when

- you need canonical icon names in TypeScript
- you want to browse icons by category
- you need to normalize loose user input into a valid icon name
- you want direct package file paths for rendering or build tooling

## What it exports

- `OPEN_ICON_NAMES` for the full typed list
- `OPEN_ICON_CATEGORIES` for the category list
- `OPEN_ICON_CATEGORY_TO_NAMES` for grouped browsing
- `OPEN_ICON_KEY_TO_NAME` for constant-like lookups
- `resolveOpenIconName`, `getOpenIconFilePath`, and `getOpenIconImportPath` for runtime resolution

## Example

```ts
import {
  OPEN_ICON_KEY_TO_NAME,
  getOpenIconImportPath,
  resolveOpenIconName,
} from 'open-icon-svg';

const iconName = OPEN_ICON_KEY_TO_NAME.UI_SEARCH_M;
const input = resolveOpenIconName('icon_search-m.svg');
const importPath = getOpenIconImportPath(iconName);
```

## Pair it with

- `vite-plugin-open-icon` for Vite apps that import SVG modules
- `open-icon-transform` for custom pipelines outside Vite
