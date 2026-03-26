---
title: open-icon
description: The main Open Icon package with catalog helpers plus runtime and static icon access.
order: 1
---

# open-icon

`open-icon` is the primary package in this repo. It gives you the typed icon catalog, `Icons` lookup keys, a lazy runtime entrypoint, a synchronous static entrypoint, and tree-shakable named exports from `open-icon/icons`.

## Install

```bash
npm install open-icon
```

## Use it when

- you want one main package for icon lookup and rendering
- you need canonical icon names in TypeScript
- you want the main generated icon catalog in one package
- you want both lazy runtime loading and synchronous static SVG access
- you want tree-shakable named icon exports

## What it exports

- `Icons` for root lookup keys like `UI_SEARCH_M`
- `loadIcon()` from `open-icon/runtime`
- `getIcon()` from `open-icon` or `open-icon/static`
- `resolveOpenIconName`, `getOpenIconFilePath`, and `getOpenIconImportPath`
- `OPEN_ICON_NAMES`, `OPEN_ICON_CATEGORIES`, and the grouped catalog maps
- `open-icon/icons` for named SVG constants

## Runtime usage

```ts
import { Icons, getOpenIconImportPath } from 'open-icon';
import { loadIcon } from 'open-icon/runtime';

const iconName = Icons.UI_ADD_M;
const iconSvg = await loadIcon(iconName);
const importPath = getOpenIconImportPath('wayfinding/check-in');

console.log(iconSvg, importPath);
```

## Static usage

```ts
import { Icons, getIcon } from 'open-icon/static';
import { IconAddM } from 'open-icon/icons';

const iconSvg = getIcon(Icons.UI_ADD_M);

console.log(IconAddM, iconSvg);
```

## Pair it with

- `open-icon-svg` when you also want direct file imports
- `vite-plugin-open-icon` when you want import-time transforms in Vite
- `open-icon-transform` for custom pipelines outside Vite
