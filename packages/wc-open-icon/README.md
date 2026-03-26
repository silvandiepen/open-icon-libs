# wc-open-icon

`wc-open-icon` exposes a custom element for Open Icon plus helpers to register it in any app or directly from an ESM CDN.

## Install

```bash
npm install wc-open-icon
```

## Use the custom element

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

The custom element uses the lazy `open-icon/runtime` entrypoint and loads only the icon it needs.

## Use the static server helper

```ts
import { renderStaticOpenIconMarkup, Icons } from 'wc-open-icon/static';

const html = renderStaticOpenIconMarkup(Icons.UI_SEARCH_M, 'Search');
```

Use `wc-open-icon/static` when you need synchronous HTML during SSR, static site generation, or non-browser templating.

## Exports

- `OpenIconElement`
- `defineOpenIconElement()`
- `loadWcOpenIconMarkup()` for async runtime loading
- `wc-open-icon/auto`
- `renderStaticOpenIconMarkup()` from `wc-open-icon/static`
- `Icons`
- the shared `open-icon/runtime` helpers from the root entrypoint
- the shared `open-icon/static` helpers from `wc-open-icon/static`
