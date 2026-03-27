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

## Use directly from a generic CDN

If you want to use the package in plain HTML without `npm install`, load the dedicated CDN build instead of the runtime package entry:

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/wc-open-icon@latest/dist/cdn/auto.js"
></script>

<open-icon name="ui/search-m"></open-icon>
```

That build fetches SVGs from `https://api.open-icon.org/v1/icons/:name.svg`, so it works on generic npm CDNs such as `jsDelivr` and `unpkg` without relying on bare-import rewriting. You can override the API origin per element:

```html
<open-icon
  name="ui/search-m"
  title="Search"
  api-base-url="https://api.open-icon.org"
></open-icon>
```

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
- `defineCdnOpenIconElement()` from `wc-open-icon/cdn`
- `loadCdnOpenIconMarkup()` from `wc-open-icon/cdn`
- `wc-open-icon/cdn/auto`
- `renderStaticOpenIconMarkup()` from `wc-open-icon/static`
- `Icons`
- the shared `open-icon/runtime` helpers from the root entrypoint
- the shared `open-icon/static` helpers from `wc-open-icon/static`
