# Branded Short URL and QR Code POC

A proof-of-concept internal tool for governed branded short URLs and scan-safe QR codes. Short URLs stay stable while destinations can be edited later, so printed QR codes, signage, email links, and campaign materials do not need to change when a destination changes.

This prototype is intended for internal review and demonstration.

## Features

- Create redirect items with title, destination, generated code, optional custom slug, expiration, status, owner, and notes.
- Visit `/:code` to redirect to the current destination.
- Expired or inactive links show a branded unavailable page.
- Download QR codes as PNG or SVG in small, medium, or large sizes.
- QR codes point to the stable short URL, not the long destination.
- Edit title, destination, expiration, active status, owner, and notes without changing the short URL.
- Local JSON persistence for development and Netlify Blobs persistence for the hosted demo.

## Scripts

```sh
npm install
npm run dev
npm run build
npm run preview
```

## Environment

Copy `.env.example` to `.env` if you want to override defaults.

- `PUBLIC_BASE_URL`: canonical public base URL used for stable short links and QR code targets.
- `LINK_STORE_PATH`: local JSON file used for demo persistence.
- `LINK_BLOBS_STORE`: Netlify Blobs store name used for hosted demo persistence.
- `LINK_BLOBS_KEY`: Netlify Blobs key used for the link registry JSON payload.

## Deploy Notes

This POC is unauthenticated and intended for demo review only. Local development uses JSON file storage. Netlify deploys automatically use Netlify Blobs so create/edit actions and redirects can work across deploys.

For an internal production version, add authentication, role-based governance, audit history, link ownership, review workflow, analytics, malware/phishing checks, and domain allow-lists before launch.

## Viewable Demo on Netlify

Netlify can build this repo directly from GitHub. The included `netlify.toml` sets:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `22`

Set this environment variable in Netlify after the first deploy URL is known:

- `PUBLIC_BASE_URL`: your Netlify site URL or branded custom domain, for example `https://mayo-shortcodes.netlify.app`.

The app uses the Astro Netlify adapter during Netlify builds and Netlify Blobs for hosted persistence. QR codes and redirects will point to `PUBLIC_BASE_URL` when it is configured.

## Viewable Demo on Google Cloud Run

This repo includes a `Dockerfile` for a simple Cloud Run-compatible demo deployment.

```sh
gcloud run deploy cdp-alpha-shortcodes --source .
```

The app includes `start` and `gcp-build` scripts so Google Cloud buildpacks can build and run it from source. The `Dockerfile` is also available if the deployment pipeline prefers explicit container builds.

Suggested Cloud Run environment variables:

- `PUBLIC_BASE_URL`: the deployed service URL or branded custom domain.
- `LINK_STORE_PATH`: leave as `./data/links.json` for a temporary demo.

The current JSON storage is ephemeral in Cloud Run. Seed links will be available, and edits can work for a running demo instance, but changes should not be treated as durable across restarts, redeploys, or scaling events.
