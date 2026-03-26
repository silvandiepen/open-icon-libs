# vue-open-icon

`vue-open-icon` exposes Vue icon components together with the shared `Icons` lookup object from the Open Icon catalog.

## Install

```bash
npm install vue-open-icon vue
```

## Use the client component

```ts
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
```

```vue
<script setup lang="ts">
import { Icon, Icons } from 'vue-open-icon';
</script>

<template>
  <Icon :name="Icons.UI_SEARCH_M" />
  <Icon :name="Icons.WAYFINDING_CHECK_IN" title="Check in" class="app-icon" />
</template>
```

`Icon` uses the lazy `open-icon/runtime` entrypoint and resolves the SVG for the icon you ask for.

## Use the static component

```vue
<script setup lang="ts">
import { StaticIcon, Icons } from 'vue-open-icon/static';
</script>

<template>
  <StaticIcon :name="Icons.UI_SEARCH_M" />
</template>
```

Use `vue-open-icon/static` when you want fully synchronous output for static generation or SSR without relying on server prefetch hooks.

## Exports

- `Icon` and default export for the lazy client/runtime path
- `StaticIcon` from `vue-open-icon/static` for synchronous SSR/static output
- `Icons`
- the shared `open-icon/runtime` helpers from the root entrypoint
- the shared `open-icon/static` helpers from `vue-open-icon/static`
