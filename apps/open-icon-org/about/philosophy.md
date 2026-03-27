---
title: Philosophy
description: Understand the core principles behind how Open Icon is authored, named, and shipped.
order: 1
---

# Philosophy

Open Icon is meant to stay practical:

- ever-extending instead of frozen
- open source instead of locked into one product
- SVG-first instead of screenshot-driven
- customizable with CSS-like controls and API transforms
- usable in apps, sites, docs, build pipelines, and scripts

## Icons first

The system is designed around the icons themselves, not around one framework.

- There is one canonical SVG source of truth.
- Names should stay predictable.
- Customization should stay external instead of baking edits into every file.
- Packages and the API should expose the same icon system in different runtimes.

## Why the transform exists

Open Icon source files are not treated as final output. They are semantic input for a transform pipeline.

That keeps the source files consistent while still letting the runtime control:

- fills
- secondary fills
- stroke colors
- stroke widths
- opacity
- line caps and joins

## Practical rules

- Keep the source SVG clean.
- Prefer line-based construction over filled silhouettes.
- Normalize authoring patterns so the runtime can stay predictable.
- Keep the icon system framework-agnostic.

If you want the concrete source SVG rules and color mappings, continue with the [Icon Authoring Guide](./authoring/).
