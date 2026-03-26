---
title: react-open-icon
description: React component package for rendering Open Icon assets with shared icon lookup helpers.
order: 3
---

# react-open-icon

`react-open-icon` gives React apps two icon component entrypoints on top of the shared Open Icon catalog.

## Install

```bash
npm install react-open-icon react
```

## Use it when

- you want `<Icon name={Icons.UI_SEARCH_M} />` in React projects
- you want the default client path to load icons lazily
- you want an explicit static/SSR component when markup must be synchronous

## What it exports

- `Icon` from `react-open-icon`
- `StaticIcon` from `react-open-icon/static`
- `Icons` and shared `open-icon` helpers/types

## Client/runtime usage

```tsx
import { Icon, Icons } from 'react-open-icon';

export const App = () => (
  <div>
    <Icon name={Icons.UI_SEARCH_M} />
    <Icon name={Icons.WAYFINDING_CHECK_IN} title="Check in" className="app-icon" />
  </div>
);
```

The root `Icon` component uses `open-icon/runtime`, so it keeps icon markup behind per-icon loaders.

## Static and SSR usage

```tsx
import { StaticIcon, Icons } from 'react-open-icon/static';

export const App = () => (
  <StaticIcon name={Icons.UI_SEARCH_M} />
);
```

Use `react-open-icon/static` when you want synchronous SVG markup during SSR or static rendering. If you stay on the root `Icon` component during server rendering, preload the icon through `loadIcon()` first.
