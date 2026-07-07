# Deployment Guide

This project is configured for deployment to both GitHub Pages and Vercel.

## Option 1: GitHub Pages (Automatic)

The workflow is already set up in `.github/workflows/deploy.yml`.

### Setup Steps:
1. Go to **Settings → Pages** on your repository
2. Under "Build and deployment":
   - Source: Select "GitHub Actions"
3. Push to `main` branch — the workflow runs automatically
4. Your site will be available at `https://joelllllll07.github.io/gobite/`

**Note:** The workflow builds and deploys automatically on every push to `main`.

## Option 2: Vercel (Recommended for TanStack Start)

TanStack Start apps work best on Vercel due to native SSR/streaming support.

### Setup Steps:
1. Go to [vercel.com/import](https://vercel.com/import/github)
2. Click "Import Git Repository"
3. Select `joelllllll07/gobite`
4. Configure project settings:
   - Framework: Auto-detected as TanStack Start
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click "Deploy"
6. Your site will be available at `https://gobite.vercel.app/`

### Auto-Deployments:
- Every push to `main` automatically deploys to production
- Pull requests get preview deployments

## Local Testing

Before deploying, test locally:

```bash
# Development mode
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

## Build Output

- **GitHub Pages:** Static files output to `dist/`
- **Vercel:** Full SSR support with Node.js backend

Choose Vercel for the best TanStack Start experience, or GitHub Pages for a free static hosting option.
