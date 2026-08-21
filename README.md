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
- Local JSON persistence for a simple unauthenticated POC.

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

## Deploy Notes

This POC uses local JSON file storage, which is appropriate for demos and local review. For a hosted environment, replace the storage module with durable storage such as SQLite, Postgres, or a platform KV/database service.

For an internal production version, add authentication, role-based governance, audit history, link ownership, review workflow, analytics, malware/phishing checks, and domain allow-lists before launch.
