---
title: open-icon
description: The main Open Icon package with catalog helpers and runtime icon access.
order: 1
---

# open-icon

`open-icon` is the primary package in this repo. It gives you the typed icon catalog, `Icons` lookup keys, direct SVG access through `getIcon()`, and tree-shakable named exports from `open-icon/icons`.

## Install

```bash
npm install open-icon
```

## Use it when

- you want one main package for icon lookup and rendering
- you need canonical icon names in TypeScript
- you want the main generated icon catalog in one package
- you want direct SVG strings or tree-shakable named icon exports

## What it exports

- `Icons` for root lookup keys like `UI_SEARCH_M`
- `getIcon()` for direct SVG string access
- `resolveOpenIconName`, `getOpenIconFilePath`, and `getOpenIconImportPath`
- `OPEN_ICON_NAMES`, `OPEN_ICON_CATEGORIES`, and the grouped catalog maps
- `open-icon/icons` for named SVG constants

## Example

```ts
import { Icons, getIcon, getOpenIconImportPath } from 'open-icon';
import { IconAddM } from 'open-icon/icons';

const iconName = Icons.UI_ADD_M;
const iconSvg = getIcon(iconName);
const importPath = getOpenIconImportPath('wayfinding/check-in');

console.log(IconAddM, iconSvg, importPath);
```

## Pair it with

- `open-icon-svg` when you also want direct file imports
- `vite-plugin-open-icon` when you want import-time transforms in Vite
- `open-icon-transform` for custom pipelines outside Vite
