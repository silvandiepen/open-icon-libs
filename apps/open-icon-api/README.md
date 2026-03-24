# open-icon-api

Cloudflare Worker API for `api.open-icon.org`.

## Purpose

The API owns:

- icon listing and search
- canonical icon detail responses
- raw SVG delivery
- best-effort PNG conversion through Cloudflare image transformations
- package metadata endpoints

The docs app can either build from local package data or point its generated JSON at this API by setting:

```bash
OPEN_ICON_API_BASE_URL=https://api.open-icon.org
```

## Main endpoints

- `GET /health`
- `GET /v1/catalog`
- `GET /v1/categories`
- `GET /v1/icons`
- `POST /v1/icons/search`
- `GET /v1/icons/:name`
- `GET /v1/icons/:name.svg`
- `GET /v1/icons/:name.png`
- `GET /v1/packages`
- `GET /v1/packages/:name`

## Build

```bash
npm --workspace open-icon-api run build
```

## Deploy

```bash
npm --workspace open-icon-api run build
npx wrangler deploy
```

The build step copies the icon SVGs into the Worker asset directory so deploys remain atomic: Worker code and icon files ship together.

## GitHub Actions secrets

For the Cloudflare deployment workflow, configure:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Optional repository variables:

- `OPEN_ICON_API_BASE_URL`
- `CLOUDFLARE_PAGES_PROJECT_NAME`
