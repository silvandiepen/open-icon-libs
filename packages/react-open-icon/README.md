# react-open-icon

`react-open-icon` exposes React icon components together with the shared `Icons` lookup object from the Open Icon catalog.

## Install

```bash
npm install react-open-icon react
```

## Use the client component

```tsx
import { Icon, Icons } from 'react-open-icon';

export const App = () => (
  <>
    <Icon name={Icons.UI_SEARCH_M} />
    <Icon name={Icons.WAYFINDING_CHECK_IN} title="Check in" />
  </>
);
```

`Icon` uses the lazy `open-icon/runtime` entrypoint. For server rendering, preload the icon through `loadIcon()` or use the static entrypoint below.

## Use the static component

```tsx
import { StaticIcon, Icons } from 'react-open-icon/static';

export const App = () => (
  <StaticIcon name={Icons.UI_SEARCH_M} />
);
```

Use `react-open-icon/static` when you need synchronous markup during SSR or static rendering.

## Exports

- `Icon` for the lazy client/runtime path
- `StaticIcon` from `react-open-icon/static` for synchronous SSR/static output
- `Icons`
- the shared `open-icon/runtime` helpers from the root entrypoint
- the shared `open-icon/static` helpers from `react-open-icon/static`
