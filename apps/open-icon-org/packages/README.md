---
title: Packages
description: Understand the purpose of each package in the Open Icon monorepo.
order: 2
---

# Packages

The repo is split into four layers so apps can depend on only the parts they need.

<open-icon-package-grid></open-icon-package-grid>

## How the layers fit together

- `open-icon` is the main package for catalog helpers and runtime icon access
- `open-icon-svg` ships the raw SVG files
- `open-icon-transform` turns raw SVG content into output that matches the Open Icon pipeline
- `vite-plugin-open-icon` applies that transform automatically when Vite loads SVG modules

## Package pages

- [open-icon](./open-icon/)
- [open-icon-svg](./open-icon-svg/)
- [open-icon-transform](./open-icon-transform/)
- [vite-plugin-open-icon](./vite-plugin-open-icon/)

## Delivery model

The packages are the source of truth in the repo. The API app builds on top of them, and the docs app can either:

- generate its JSON payloads directly from package data
- or generate them with `OPEN_ICON_API_BASE_URL=https://api.open-icon.org` so the site points at the deployed API
