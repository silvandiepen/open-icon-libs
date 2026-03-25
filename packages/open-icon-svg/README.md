# open-icon-svg

`open-icon-svg` is the raw SVG asset package for Open Icon.

It exists so apps, loaders, and tooling can import the original files directly without pulling in the main catalog/helper package.

## Install

```bash
npm install open-icon-svg
```

## Usage

Import SVG files directly from the package:

```ts
import searchIconUrl from 'open-icon-svg/icons/ui/icon_search-m.svg';
import checkInIconUrl from 'open-icon-svg/icons/wayfinding/icon_check%20in.svg';
```

Use it with `vite-plugin-open-icon` when you want transform-at-import behavior:

```ts
import searchIcon from 'open-icon-svg/icons/ui/icon_search-m.svg?open-icon';
```

## Package split

- `open-icon` is the main catalog/helper package
- `open-icon-svg` ships only the raw SVG files
- `open-icon-transform` handles SVG transformation in scripts and tooling
- `vite-plugin-open-icon` connects the transform layer to Vite
