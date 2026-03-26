---
title: Icon Authoring Guide
description: Learn how Open Icon source SVGs are structured, transformed, and prepared for runtime styling.
order: 2
---

# Icon Authoring Guide

This page documents the Open Icon source-icon rules, the transformation pipeline, and the runtime styling hooks that come out of it.

Use it when you:

- want to contribute new icons to Open Icon
- want to prepare your own SVGs so they behave like Open Icon assets
- want to use `open-icon-transform` in your own tooling without guessing the expected source format

## Philosophy

Open Icon is built around line-based icons first.

- The base shape of an icon should usually be drawn with lines, not large filled silhouettes.
- The standard source stroke width is `4`.
- Fills are used as intentional accent or alternate areas, not as the main structure by default.
- Customization should happen through CSS variables after transform, not by manually duplicating icon files for every variant.

That approach keeps the catalog visually consistent and makes the transformed output easy to theme.

## Canonical source rules

When authoring a source SVG, these are the conventions to follow:

- Use `stroke-width:4` as the normal line weight.
- Use `stroke:black` for primary lines.
- Use `stroke:red` for accent or secondary lines.
- Use `fill:red` for the primary fill area.
- Use `fill:white` for an alternate or secondary fill area.
- Use `fill:red` together with `opacity:.5` when the fill should be controlled through the primary fill opacity variable.
- Keep line caps and joins explicit when needed, usually `round`.
- Name files clearly. The transform strips the `icon_` prefix when present, so `icon_cat-head.svg` becomes `cat-head`.

## What the transformer does

The `open-icon-transform` pipeline applies the same steps used by the Open Icon packages and docs:

1. Remove XML declarations and comments.
2. Optionally simplify hex colors to the nearest named base color.
3. Flatten group opacity onto child nodes.
4. Apply the Open Icon replacement rules.
5. Remove configured tags and attributes.
6. Interpolate `{{...}}` variables from defaults, metadata, and custom config data.

It also derives metadata from the file name:

- `fileName`: a slug-safe name
- `componentName`: a PascalCase name used in replacements

For example, a source file named `icon_loader-dots 2.svg` becomes:

- `fileName`: `loader-dots-2`
- `componentName`: `LoaderDots2`

## Source to runtime mapping

The transform is semantic. It does not preserve the original authoring colors as final colors. It converts them into runtime variables.

| Source pattern | Runtime output |
|---|---|
| `fill:red;` | `fill: var(--icon-fill, {{default.iconFill}});` |
| `opacity:0.5;fill:red;` | `fill: var(--icon-fill, {{default.iconFill}}); opacity: var(--icon-fill-opacity, {{default.iconFillOpacity}});` |
| `fill:white;` | `fill: var(--icon-fill-secondary, white);` |
| `stroke:black;` | `stroke: var(--icon-stroke-color, currentColor);` |
| `stroke:red;` | `stroke: var(--icon-stroke-color-secondary, var(--icon-stroke-color, currentColor));` |
| `stroke-width:1;` | `--icon-stroke-width-xs` token |
| `stroke-width:2;` | `--icon-stroke-width-s` token |
| `stroke-width:4;` | `--icon-stroke-width-m` token |
| `stroke-width:6;` | `--icon-stroke-width-l` token |
| `stroke-width:12;` | `--icon-stroke-width-xl` token |
| `stroke-linecap:round;` | `stroke-linecap: var(--icon-stroke-linecap, round);` |
| `stroke-linejoin:round;` | `stroke-linejoin: var(--icon-stroke-linejoin, round);` |

Secondary strokes get one extra step after replacement: their width tokens are rewritten to secondary width hooks with a primary fallback.

So a secondary line with `stroke:red; stroke-width:4;` becomes a width based on:

```css
var(--icon-stroke-width-secondary-m, var(--icon-stroke-width-m, calc(var(--icon-stroke-width, 5) * 1)))
```

That means the source icon should still use `stroke-width:4`, while the final rendered width can be controlled separately for primary and secondary lines.

## Why `4` in source but `5` at runtime

The source icon system uses `4` as the canonical medium stroke in the SVG files.

The default runtime variable currently uses `5` for `--icon-stroke-width` fallback. That gives the rendered icons a slightly heavier default appearance while keeping the source files normalized around the same authoring width token.

So the rule is:

- author with `stroke-width:4`
- let the runtime decide the final displayed stroke width

## Example

Source SVG:

```svg
<svg id="Layer_1" data-name="Layer_1" viewBox="0 0 24 24">
  <path style="fill:red; opacity:.5;" d="..." />
  <path style="fill:none;stroke:black;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;" d="..." />
  <path style="fill:none;stroke:red;stroke-width:4;" d="..." />
</svg>
```

Typical transformed output shape:

```svg
<svg id="MyIcon" data-name="MyIcon" viewBox="0 0 24 24">
  <path style="fill: var(--icon-fill, rgba(0, 0, 0, 0)); opacity: var(--icon-fill-opacity, 1);" d="..." />
  <path style="fill:none;stroke: var(--icon-stroke-color, currentColor);stroke-width:var(--icon-stroke-width-m, calc(var(--icon-stroke-width, 5) * 1));stroke-linecap: var(--icon-stroke-linecap, round);stroke-linejoin: var(--icon-stroke-linejoin, round);" d="..." />
  <path style="fill:none;stroke: var(--icon-stroke-color-secondary, var(--icon-stroke-color, currentColor));stroke-width:var(--icon-stroke-width-secondary-m, var(--icon-stroke-width-m, calc(var(--icon-stroke-width, 5) * 1)));" d="..." />
</svg>
```

## Runtime styling hooks

These are the main CSS variables the transformed output expects:

- `--icon-fill`
- `--icon-fill-opacity`
- `--icon-fill-secondary`
- `--icon-line-color`
- `--icon-stroke-color`
- `--icon-stroke-color-secondary`
- `--icon-stroke-width`
- `--icon-stroke-width-xs`
- `--icon-stroke-width-s`
- `--icon-stroke-width-m`
- `--icon-stroke-width-l`
- `--icon-stroke-width-xl`
- `--icon-stroke-width-secondary-xs`
- `--icon-stroke-width-secondary-s`
- `--icon-stroke-width-secondary-m`
- `--icon-stroke-width-secondary-l`
- `--icon-stroke-width-secondary-xl`
- `--icon-stroke-linecap`
- `--icon-stroke-linejoin`

## Special semantic colors

Most icons should only need the standard black, red, and white authoring colors.

A few extra source colors are reserved for special transform behaviors:

- `teal` maps to an invisible stroke hook
- `purple`, `orange`, `gray`, and `brown` are used for rotating handle transforms in clock-like icons

If you do not need those behaviors, do not use those colors.

## Using the transformer with your own icons

If you want your own SVGs to behave like Open Icon assets:

1. Author the SVG with the source rules above.
2. Run `open-icon-transform`.
3. Keep customization in variables and theme code, not by editing the transformed output manually.

Example:

```bash
npx open-icon-transform@latest src/my-icons --output dist/my-icons
```

```ts
import { transformOpenIconSvg } from 'open-icon-transform';

const output = transformOpenIconSvg(sourceSvg, '/icons/icon_custom-bell.svg');
```

## Contributor checklist

- Use a clear file name.
- Prefer line-based construction.
- Use `stroke-width:4` for the normal line weight.
- Use Open Icon semantic colors instead of arbitrary final colors.
- Keep the icon clean: no comments, unnecessary metadata, or editor leftovers.
- Think about what should be primary line, secondary line, primary fill, and secondary fill after transform.

## Related pages

- [Icons](/icons/)
- [Packages](/packages/)
- [open-icon-transform package page](/packages/open-icon-transform/)
