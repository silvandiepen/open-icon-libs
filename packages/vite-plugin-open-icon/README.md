# vite-plugin-open-icon

Vite plugin that applies `open-icon-transform` to SVG modules at load time.

## Installation

```bash
npm install vite-plugin-open-icon
```

## Basic Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { openIconSvgLoaderPlugin } from 'vite-plugin-open-icon';

export default defineConfig({
  plugins: [openIconSvgLoaderPlugin()],
});
```

Import SVGs with the loader query (default: `open-icon`):

```ts
const svgModules = import.meta.glob('/src/assets/icons/**/*.svg', {
  query: '?open-icon',
  import: 'default',
});
```

## API

### `openIconSvgLoaderPlugin(settings?)`

Creates the Vite plugin.

- It only transforms modules ending in `.svg`
- It only runs when query contains configured key (default `open-icon`)
- It returns a JS module with transformed SVG string as default export

### Re-exports

The plugin package re-exports from `open-icon-transform`:

- `transformOpenIconSvg`
- `openIconSvgLoaderDefaults`
- shared types

## Custom Query Example

```ts
openIconSvgLoaderPlugin({ query: 'iconify' });

// then load with:
// import icon from './icon.svg?iconify'
```

## Custom Transform Example

```ts
openIconSvgLoaderPlugin({
  replaceData: [['fill:red;', 'fill: {{brand.primary}};']],
  removeData: [],
  simplifyColors: false,
  configData: {
    brand: { primary: '#123456' },
  },
});
```

## Test Coverage

Plugin tests verify:

- default query behavior
- custom query behavior
- non-svg skip behavior
- encoded path handling
- settings passthrough
- equivalence to direct `transformOpenIconSvg` output

## Local Linking

From monorepo root:

```bash
npm install
npm --workspace vite-plugin-open-icon run build
```

Then link package globally:

```bash
cd packages/vite-plugin-open-icon
npm link
```

In consuming project:

```bash
npm link vite-plugin-open-icon
```
