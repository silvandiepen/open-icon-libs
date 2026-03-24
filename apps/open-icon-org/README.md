---
title: Open Icon
description: Browse the packages, inspect the icon catalog, and pick the right Open Icon layer for your runtime.
---

# Open Icon

Open Icon packages the raw SVG library, the transform pipeline, and the Vite loader into one repo. This site keeps the content Markdown-first, while the icon gallery and package cards are loaded from the package data itself.

<open-icon-site-stats></open-icon-site-stats>

## Pick the right package

Choose the smallest layer that matches your runtime:

- `open-icon-svg` for the canonical catalog, raw files, aliases, and typed names
- `open-icon-transform` for direct SVG processing in scripts, CLIs, or custom build steps
- `vite-plugin-open-icon` for Vite apps that want transform-at-import behavior

<open-icon-package-grid></open-icon-package-grid>

## Browse the icon catalog

The live gallery below is generated from `packages/open-icon-svg/icons` and exposes the same canonical names you use from the package.

<open-icon-gallery mode="preview" limit="18"></open-icon-gallery>

## Start with the SVG package

```bash
npm install open-icon-svg
```

```ts
import {
  OPEN_ICON_CATEGORY_TO_NAMES,
  OPEN_ICON_KEY_TO_NAME,
  getOpenIconImportPath,
} from 'open-icon-svg';

const iconName = OPEN_ICON_KEY_TO_NAME.UI_SEARCH_M;
const importPath = getOpenIconImportPath(iconName);
const uiIcons = OPEN_ICON_CATEGORY_TO_NAMES.ui;
```

## Next steps

- Visit [Icons](/icons/) to search the full catalog and inspect import paths
- Visit [Packages](/packages/) to see install guidance for each package in the repo
- Visit [API](/api/) to see the Cloudflare-powered API layer for search and asset delivery
