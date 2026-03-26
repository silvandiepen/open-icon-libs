---
title: wc-open-icon
description: Web component package for rendering Open Icon assets with shared icon lookup helpers.
order: 5
---

# wc-open-icon

`wc-open-icon` gives any app a custom element layer on top of the shared Open Icon catalog, plus a static server-render helper.

## Install

```bash
npm install wc-open-icon
```

## Use it when

- you want a framework-neutral custom element
- you want to load the icon component from an external URL
- you want the default client path to load icons lazily
- you want a static helper for SSR or server templating

## What it exports

- `OpenIconElement`
- `defineOpenIconElement()`
- `loadWcOpenIconMarkup()`
- `wc-open-icon/auto` for auto-registration
- `renderStaticOpenIconMarkup()` from `wc-open-icon/static`
- `Icons` and shared `open-icon` helpers/types

## Client/runtime usage

```html
<script type="module">
  import { defineOpenIconElement } from 'wc-open-icon';

  defineOpenIconElement();
</script>

<open-icon name="ui/search-m"></open-icon>
```

```html
<script type="module" src="https://esm.sh/wc-open-icon/auto"></script>
<open-icon name="ui/search-m"></open-icon>
```

The custom element uses `open-icon/runtime`, so it loads just the icon it needs.

## Static and SSR usage

```ts
import { renderStaticOpenIconMarkup, Icons } from 'wc-open-icon/static';

const html = renderStaticOpenIconMarkup(Icons.UI_SEARCH_M, 'Search');
```

Use `wc-open-icon/static` when you want synchronous HTML output for SSR or static generation.
