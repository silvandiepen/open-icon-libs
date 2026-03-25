---
title: API
description: Use api.open-icon.org for icon search, metadata, raw SVG delivery, and PNG output.
order: 3
archive: sections
---

# Open Icon API

The docs site is static, but the Open Icon platform also exposes a Worker API at `api.open-icon.org`.

## Why the API exists

- expose the icon catalog to external apps
- search by canonical name or alias
- deliver raw SVGs from stable canonical routes
- provide PNG output from the same icon routes
- keep the docs and external consumers aligned on one metadata contract

## Main endpoints

```text
GET /v1
GET /health
GET /v1/catalog
GET /v1/categories
GET /v1/icons
POST /v1/icons/search
GET /v1/icons/:name
GET /v1/icons/:name.svg
GET /v1/icons/:name.png
GET /v1/packages
GET /v1/packages/:name
```

## Search example

```bash
curl "https://api.open-icon.org/v1/icons?query=search&category=ui&page=1&perPage=24"
```

`GET /v1/catalog` returns summary data by default. Add `?include=entries` when you need the full icon entry list:

```bash
curl "https://api.open-icon.org/v1/catalog?include=entries"
```

## Search with a JSON payload

Use `POST` when the search config is too large or awkward for the query string.

```bash
curl "https://api.open-icon.org/v1/icons/search" \
  -H "content-type: application/json" \
  -d '{"query":"camera","category":"media","page":1,"perPage":12}'
```

## Icon detail example

```bash
curl "https://api.open-icon.org/v1/icons/ui%2Fsearch-m"
```

## SVG with inline transforms

```bash
curl "https://api.open-icon.org/v1/icons/ui%2Fsearch-m.svg?color=%23000000&strokeWidth=2"
```

Supported transform params currently include `title`, `color`, `fill`, `fillSecondary`, `stroke`, `strokeSecondary`, `opacity`, and `strokeWidth`.

## Docs build integration

When generating this site with Girk, you can point the generated JSON at the deployed API:

```bash
OPEN_ICON_API_BASE_URL=https://api.open-icon.org npm --workspace open-icon-org run build
```

That keeps the docs static while still letting the generated payload reference the production API.
