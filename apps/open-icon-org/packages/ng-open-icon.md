---
title: ng-open-icon
description: Angular component package for rendering Open Icon assets with shared icon lookup helpers.
order: 4
---

# ng-open-icon

`ng-open-icon` gives Angular apps two standalone icon component entrypoints on top of the shared Open Icon catalog.

## Install

```bash
npm install ng-open-icon @angular/core @angular/platform-browser
```

## Use it when

- you want a standalone Angular component for icons
- you want the default client path to load icons lazily
- you want an explicit static/SSR component when markup must be synchronous

## What it exports

- `IconComponent` from `ng-open-icon`
- `StaticIconComponent` from `ng-open-icon/static`
- `Icons` and shared `open-icon` helpers/types

## Client/runtime usage

```ts
import { Component } from '@angular/core';
import { IconComponent, Icons } from 'ng-open-icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IconComponent],
  template: `
    <open-icon [name]="Icons.UI_SEARCH_M"></open-icon>
    <open-icon [name]="Icons.WAYFINDING_CHECK_IN" title="Check in"></open-icon>
  `,
})
export class AppComponent {
  readonly Icons = Icons;
}
```

The root `IconComponent` uses `open-icon/runtime`, so it loads only the icon it needs. Treat it as the client/runtime path. For SSR or static rendering where the icon markup must exist on first render, use `ng-open-icon/static`.

## Static and SSR usage

```ts
import { Component } from '@angular/core';
import { StaticIconComponent, Icons } from 'ng-open-icon/static';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StaticIconComponent],
  template: `<open-icon-static [name]="Icons.UI_SEARCH_M"></open-icon-static>`,
})
export class AppComponent {
  readonly Icons = Icons;
}
```

Use `ng-open-icon/static` when you want synchronous SVG markup during SSR or static rendering.
