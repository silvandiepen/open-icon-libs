# open-icon

`open-icon` is the main package for the Open Icon catalog.

It gives you:

- typed icon names and categories
- a root `Icons` lookup for app code
- `getIcon()` for direct SVG string access
- tree-shakable named exports from `open-icon/icons`

## Install

```bash
npm install open-icon
```

## Root API

```ts
import { Icons, getIcon, getOpenIconImportPath } from 'open-icon';

const iconName = Icons.UI_ADD_M;
const iconSvg = getIcon(iconName);
const importPath = getOpenIconImportPath('wayfinding/check-in');
```

## Tree-shakable icons

```ts
import { IconAddM, IconUiKey } from 'open-icon/icons';

console.log(IconAddM);
console.log(IconUiKey);
```

## Package split

- `open-icon` is the main catalog/helper package
- `open-icon-svg` ships the raw SVG files
- `open-icon-transform` applies the transform pipeline in scripts and tooling
- `vite-plugin-open-icon` applies the transform pipeline during Vite imports
