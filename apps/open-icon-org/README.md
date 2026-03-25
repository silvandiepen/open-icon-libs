---
title: Open Icon
description: Open Icon is an ever-extending open source icon set built to stay easy to customize, ship, and reuse anywhere.
---

# Open Icon

Open Icon is an ever-extending open source icon set. The core idea is simple: keep the icons clean, keep the names stable, and make them easy to load and restyle anywhere.

- Load raw SVG files directly.
- Transform them in build tools or scripts.
- Use the API to search, inspect, and export variants.
- Restyle fills, strokes, opacity, and line thickness without forking the assets.

<open-icon-site-stats></open-icon-site-stats>

## Icons first

The library is designed around the icons themselves, not around one framework. That means:

- a canonical SVG source of truth
- a catalog that keeps growing over time
- predictable names and aliases
- customization that stays external instead of baking edits into every file
- open source packages and an API layer that let you use the same icon set in different runtimes

The preview below is loaded from the actual icon catalog in this repo.

<open-icon-gallery mode="preview" limit="24"></open-icon-gallery>

## Philosophy

Open Icon is meant to stay practical:

- ever-extending instead of frozen
- open source instead of locked into one product
- SVG-first instead of screenshot-driven
- customizable with CSS-like controls and API transforms
- usable in apps, sites, docs, build pipelines, and scripts

## Load it anywhere

The icon files are plain SVG assets, so they can be used directly or through one of the packages:

```bash
npm install open-icon
```

```ts
import { Icons, getIcon, getOpenIconImportPath } from 'open-icon';

const iconName = Icons.UI_SEARCH_M;
const iconSvg = getIcon(iconName);
const importPath = getOpenIconImportPath(iconName);
```

## Packages

The packages make the icon set easier to consume in different environments, but the full package comparison and install guidance live on the dedicated packages page.

[Browse the packages page](/packages/)

## Next

- Visit [Icons](/icons/) to search the full catalog and inspect import paths
- Visit [API](/api/) to use search, metadata, and SVG/PNG exports
- Visit [Packages](/packages/) for package-specific install guidance
