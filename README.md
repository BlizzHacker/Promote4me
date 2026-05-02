# Promote4.me 2.0 Delivery Monitor

Promote4.me has been rebuilt from the legacy PHP / AngularJS project into a modern delivery monitoring product.

## What works now

- Standalone React + Vite website.
- Homepage lander with two paths:
  - Customer / Mobile Tracking
  - Admin Dashboard
- Temporary admin login.
- Persistent local delivery data using browser storage.
- Delivery creation and status updates.
- Customer tracking by tracking ID or order number.
- Driver/customer lists.
- Delivery map panel.
- Bring-your-own Google Maps API key in Settings.
- Shopify Liquid snippet.
- WordPress shortcode plugin.
- Universal JavaScript embed widget.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Seed tracking IDs

- `P4-1001`
- `P4-1002`
- `P4-1003`

## Add your own Google Maps API key

1. Sign in to the Admin Dashboard.
2. Open Settings.
3. Paste the Google Maps API key.
4. Save Settings.
5. Open Route Map.

The key is stored in browser local storage for this local-first revision. A production backend should store encrypted tenant settings server-side.

## Shopify

Use:

```text
shopify/promote4me-delivery-widget.liquid
```

Replace `https://your-domain.com` with the deployed Promote4.me host.

## WordPress

Plugin folder:

```text
wordpress/promote4me-delivery-monitor
```

Shortcode:

```text
[promote4me_delivery_tracker host="https://your-domain.com"]
```

## Universal embed

Use:

```html
<script src="https://your-domain.com/embed/promote4me-widget.js" data-p4me-company="Promote4.me" data-p4me-api="https://your-domain.com"></script>
```

## Important security note

The legacy folders are preserved for reference, but they include old auth patterns and exposed credentials/API keys. Do not redeploy the legacy PHP app publicly without rotating secrets and replacing auth/CORS/database layers. See `docs/legacy-audit.md`.
