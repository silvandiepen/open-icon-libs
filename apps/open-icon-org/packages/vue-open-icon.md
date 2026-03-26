---
title: vue-open-icon
description: Vue component package for rendering Open Icon assets with shared icon lookup helpers.
order: 2
---

# vue-open-icon

`vue-open-icon` gives Vue apps two icon component entrypoints on top of the shared Open Icon catalog.

## Install

```bash
npm install vue-open-icon vue
```

## Use it when

- you want `<Icon :name="Icons.UI_SEARCH_M" />` in Vue projects
- you want the default client path to load icons lazily
- you want an explicit static/SSR component when markup must be synchronous

## What it exports

- `Icon` and the default export from `vue-open-icon`
- `StaticIcon` from `vue-open-icon/static`
- `Icons` and shared `open-icon` helpers/types

## Client/runtime usage

```vue
<script setup lang="ts">
import { Icon, Icons } from 'vue-open-icon';
</script>

<template>
  <Icon :name="Icons.UI_SEARCH_M" />
  <Icon :name="Icons.WAYFINDING_CHECK_IN" title="Check in" class="app-icon" />
</template>
```

The root `Icon` component uses `open-icon/runtime`, so it loads just the icon it needs.

## Static and SSR usage

```vue
<script setup lang="ts">
import { StaticIcon, Icons } from 'vue-open-icon/static';
</script>

<template>
  <StaticIcon :name="Icons.UI_SEARCH_M" />
</template>
```

Use `vue-open-icon/static` when you want synchronous SVG markup during static generation or SSR.

## Pair it with

- `open-icon` when you also want the base catalog package directly
- `open-icon-svg` if you also need raw SVG asset imports
- `vite-plugin-open-icon` in Vite apps that import package SVG files directly
