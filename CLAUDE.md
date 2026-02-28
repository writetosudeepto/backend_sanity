# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Sanity v3 Content Studio serving as the backend for a personal portfolio site. It consists of two services:

1. **Sanity Studio** — the CMS UI for managing portfolio content (schemas, deployed to Sanity CDN)
2. **Webhook Server** (`webhook-server.js`) — a standalone Express.js server that receives Sanity webhooks and forwards contact form submissions to Discord

## Commands

```bash
# Run Sanity Studio locally
npm run dev

# Build Sanity Studio for deployment
npm run build

# Deploy Studio to Sanity CDN (sanity.io hosting)
npm run deploy

# Deploy GraphQL API
npm run deploy-graphql

# Run the webhook server
npm start
# or
npm run webhook
```

## Architecture

### Sanity Studio (`sanity.config.js`)

- Project ID: `e82ejcg3`, dataset: `production`
- Uses `deskTool` and `visionTool` plugins
- Schemas are defined in `schemas/` and exported from `schemas/index.js`

### Schemas (`schemas/`)

Eight document types registered in `schemas/index.js`:

| Schema | Purpose |
|---|---|
| `abouts` | About section entries (title, description, image) |
| `brands` | Brand/logo entries |
| `contact` | Contact form submissions (name, email, message) |
| `experiences` | General experiences |
| `workExperience` | Work history entries |
| `skills` | Skill entries |
| `testimonials` | Testimonial entries |
| `works` | Portfolio projects (title, description, projectLink, codeLink, codeSource, imgUrl, tags) |

### Webhook Server (`webhook-server.js`)

A **CommonJS** Express server (separate from the ES module Sanity config). It:
- Listens on `POST /webhook/contact` — verifies HMAC-SHA256 signature from Sanity, then sends a formatted Discord embed notification
- Exposes `GET /health` for uptime checks
- Is deployed separately to Railway; Sanity Studio is deployed to Sanity CDN

> Note: Signature verification is currently bypassed (commented out) for debugging — the `verifySignature` middleware logs but does not reject invalid signatures.

### Module Systems

- `sanity.config.js`, `sanity.cli.js`, and all `schemas/*.js` use **ES modules** (`import`/`export`)
- `webhook-server.js` uses **CommonJS** (`require`/`module.exports`)

## Environment Variables

Copy `.env.example` to `.env` and populate:

```
DISCORD_WEBHOOK_URL=   # Discord webhook URL for contact notifications
SANITY_WEBHOOK_SECRET= # HMAC secret matching the Sanity webhook config
PORT=3001              # Optional; defaults to 3001
```

## Code Style

Prettier is configured in `package.json`:
- No semicolons (`"semi": false`)
- Single quotes (`"singleQuote": true`)
- Print width 100
- No bracket spacing (`"bracketSpacing": false`)

## Deployment

- **Sanity Studio**: `npm run deploy` publishes to `<projectId>.sanity.studio`
- **Webhook server**: Deployed to Railway. Set env vars (`DISCORD_WEBHOOK_URL`, `SANITY_WEBHOOK_SECRET`) in the Railway dashboard. After deploying, update the Sanity webhook URL at sanity.io/manage → Project → API → Webhooks to point to `https://<railway-url>/webhook/contact`.
