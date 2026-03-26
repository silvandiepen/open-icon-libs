---
title: Packages
description: Understand the purpose of each package in the Open Icon monorepo.
order: 2
---

# Packages

The repo is split into core packages and framework wrappers so apps can depend on only the parts they need.

<open-icon-package-grid></open-icon-package-grid>

## Core packages

- `open-icon` is the main package for catalog helpers, lazy runtime loading, and synchronous static access
- `open-icon-svg` ships the raw SVG files
- `open-icon-transform` turns raw SVG content into output that matches the Open Icon pipeline
- `vite-plugin-open-icon` applies that transform automatically when Vite loads SVG modules

Core package detail pages:

- [open-icon](./open-icon/)
- [open-icon-svg](./open-icon-svg/)
- [open-icon-transform](./open-icon-transform/)
- [vite-plugin-open-icon](./vite-plugin-open-icon/)

## Framework packages

- `vue-open-icon` adds Vue client and static icon components on top of `open-icon`
- `react-open-icon` adds React client and static icon components on top of `open-icon`
- `ng-open-icon` adds Angular client and static icon components on top of `open-icon`
- `wc-open-icon` adds a custom element plus static markup helpers on top of `open-icon`

Framework package detail pages:

- [vue-open-icon](./vue-open-icon/)
- [react-open-icon](./react-open-icon/)
- [ng-open-icon](./ng-open-icon/)
- [wc-open-icon](./wc-open-icon/)

## Rendering modes

- The default root entrypoint of each wrapper package is the runtime/client path. It keeps icon markup behind per-icon loaders so normal app bundles do not have to include the full catalog payload by default.
- Each framework wrapper also exposes a static entrypoint for synchronous rendering when SSR, static site generation, or non-reactive server templating needs markup immediately.
- The package pages below document which entrypoint to use for each framework and rendering mode.

## Delivery model

The packages are the source of truth in the repo. The API app builds on top of them, and the docs app can either:

- generate its JSON payloads directly from package data
- or generate them with `OPEN_ICON_API_BASE_URL=https://api.open-icon.org` so the site points at the deployed API
