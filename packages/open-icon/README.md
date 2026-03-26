# open-icon

`open-icon` is the main package for the Open Icon catalog.

It gives you:

- typed icon names and categories
- a root `Icons` lookup for app code
- `loadIcon()` from `open-icon/runtime` for per-icon lazy loading
- `getIcon()` from `open-icon` or `open-icon/static` for synchronous SVG access
- tree-shakable named exports from `open-icon/icons`

## Install

```bash
npm install open-icon
```

## Choose the entrypoint

```ts
import { Icons, getIcon, getOpenIconImportPath } from 'open-icon';
import { loadIcon } from 'open-icon/runtime';

const iconName = Icons.UI_ADD_M;
const iconSvg = getIcon(iconName);
const lazyIconSvg = await loadIcon(iconName);
const importPath = getOpenIconImportPath('wayfinding/check-in');
```

- `open-icon` and `open-icon/static` include synchronous `getIcon()` access. Use them for static rendering, server rendering, or tooling.
- `open-icon/runtime` keeps icon markup behind per-icon loaders. Use it when wrappers or apps should avoid pulling the full icon map into the default client path.

## Tree-shakable icons

```ts
import { IconAddM, IconUiKey } from 'open-icon/icons';

console.log(IconAddM);
console.log(IconUiKey);
```

## Package split

- `open-icon` is the main catalog/helper package
- `open-icon/runtime` is the lazy runtime entrypoint
- `open-icon/static` is the synchronous full-catalog entrypoint
- `open-icon-svg` ships the raw SVG files
- `open-icon-transform` applies the transform pipeline in scripts and tooling
- `vite-plugin-open-icon` applies the transform pipeline during Vite imports
