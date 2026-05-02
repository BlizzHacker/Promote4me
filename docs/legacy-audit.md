# Promote4.me Legacy Audit and 2.0 Rebuild Map

## What was found

The legacy project is split into these major areas:

- `admin/` — PHP-rendered manager dashboard.
- `mobile/` — AngularJS 1.x mobile field-team dashboard.
- `api/` — PHP API endpoints and database helpers.
- `bot/` — legacy automation area.
- `p4invite/` — invitation flow area.

## Why the old application will not work well today

1. **AngularJS 1.x is end-of-life**
   - The mobile app uses AngularJS 1.3 and `ngRoute`.
   - Modern browsers still execute some AngularJS code, but the framework is no longer a safe foundation for a production app.

2. **Bootstrap 3 / jQuery-era UI**
   - The admin and mobile layouts depend on old Bootstrap, jQuery, Morris charts, DataTables, FullCalendar 1.x, and custom DOM manipulation.
   - These libraries create dependency conflicts and mobile responsiveness problems in today’s browsers.

3. **Authentication is insecure**
   - Admin login enforcement is commented out in `admin/_header.php`.
   - The app passes tokens in query strings such as `?token=...`, which leaks through logs, browser history, and analytics.
   - Mobile auth stores tokens in `localStorage` with no refresh flow or server-side session hardening.

4. **CORS is wide open**
   - `api/index.php` allows every origin and every header. This makes the API easy to abuse.

5. **Secrets are committed**
   - Database hostname, username, password, and database name are hardcoded in `api/derp.php`.
   - A Google Maps API key is committed in `admin/_scripts.php`.
   - These credentials should be rotated immediately and moved to environment variables.

6. **Hardcoded production URLs**
   - The mobile app hardcodes `https://api.promote4.me` and `https://mobile.promote4.me`, making local dev, staging, and deployment harder.

7. **Raw SQL helper pattern**
   - The `derp_query()` helper executes raw SQL strings. Even with escaping helpers, this pattern is fragile compared with prepared statements or an ORM.

8. **Old PHP architecture**
   - The legacy app mixes rendering, authentication, business logic, and API access across PHP pages.
   - 2.0 should split frontend, backend API, storage, and authentication clearly.

## 2.0 target architecture

### Frontend

- React + Vite single-page app.
- Responsive homepage lander with two clear choices:
  - Mobile Dashboard
  - Admin Dashboard
- Shared design system and reusable dashboard components.

### Backend target

Recommended next step is one of:

- Node/Express + Prisma + PostgreSQL/MySQL, or
- Laravel 11+ API if staying in PHP, or
- Next.js full-stack if one deployment is preferred.

### Auth target

- Server-issued httpOnly secure cookies or short-lived access tokens with refresh rotation.
- Role-based access control:
  - `admin`
  - `manager`
  - `field_user`
- Never pass auth tokens in query strings.

### Restored functions

Mobile:

- Login/logout.
- Dashboard stats.
- Photo check-in upload.
- Browser geolocation.
- Nearby/all locations.
- Team directory.
- Messages.
- User settings and password change.

Admin:

- Login/logout.
- Photo stats for today, week, month.
- Schedule overview.
- Photo review.
- Location management.
- User/team management.
- Messages.
- Settings/subscription area.

## Current 2.0 implementation in this repo

The root-level Vite app is a modern replacement shell. It currently uses demo data so the restored screens can be reviewed immediately before wiring a real API.

Run locally:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Immediate security cleanup

Before putting the legacy API online again:

1. Rotate the database credentials exposed in `api/derp.php`.
2. Rotate/restrict the Google Maps key exposed in `admin/_scripts.php`.
3. Disable public access to legacy API endpoints until auth is rebuilt.
4. Remove token-in-query authentication.
5. Replace `Access-Control-Allow-Origin: *` with a strict allowlist.
