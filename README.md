# Promote4.me 2.0

Promote4.me is being rebuilt from the legacy PHP / AngularJS app into a modern responsive web application.

## What is included now

- New homepage lander with two clear portal choices:
  - Mobile Dashboard
  - Admin Dashboard
- Modern React + Vite frontend at the repo root.
- Restored dashboard concepts from the original app:
  - Photo stats
  - Check-ins
  - Nearby locations
  - Team/users
  - Messages
  - Schedules
  - Settings
- Legacy source preserved in the original folders for reference.
- Legacy audit and rebuild map in `docs/legacy-audit.md`.

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in your terminal.

## Build

```bash
npm run build
```

## Important security note

The legacy files include hardcoded credentials/API keys and old auth patterns. Do not redeploy the legacy PHP app publicly without rotating secrets and replacing the auth/CORS/database layers. See `docs/legacy-audit.md`.
