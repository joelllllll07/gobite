# Deployment Guide

This repository supports deployment to **GitHub Pages** and **Vercel**.

## GitHub Pages

A workflow is configured at:

- `.github/workflows/deploy.yml`

### Setup

1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Merge this branch into `main`.

After merge, every push to `main` triggers the workflow and deploys to GitHub Pages.

## Vercel

Configuration file:

- `vercel.json`

Configured commands:

- Install: `npm install`
- Build: `npm run build`
- Dev: `npm run dev`
- Framework: `other`

### Setup

1. Open [vercel.com/import](https://vercel.com/import).
2. Import `joelllllll07/gobite`.
3. Vercel reads `vercel.json` automatically.
4. Deploy.

## Local verification

```bash
npm install
npm run build
npm run dev
```

## Build output

`npm run build` produces:

- `.output/public` (static assets used by GitHub Pages workflow artifact upload)
- `.output/server` (server bundle used for server-capable deployments such as Vercel)
