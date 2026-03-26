# ng-open-icon

`ng-open-icon` exposes Angular icon components together with the shared `Icons` lookup object from the Open Icon catalog.

## Install

```bash
npm install ng-open-icon @angular/core @angular/platform-browser
```

## Use the client component

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

`IconComponent` uses the lazy `open-icon/runtime` entrypoint and resolves only the icon it needs. Treat it as the client/runtime path. For SSR or static rendering where the icon markup must exist on first render, use `ng-open-icon/static`.

## Use the static component

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

Use `ng-open-icon/static` when you want synchronous icon markup for SSR or static rendering.

## Exports

- `IconComponent` for the lazy client/runtime path
- `StaticIconComponent` from `ng-open-icon/static` for synchronous SSR/static output
- `Icons`
- the shared `open-icon/runtime` helpers from the root entrypoint
- the shared `open-icon/static` helpers from `ng-open-icon/static`
