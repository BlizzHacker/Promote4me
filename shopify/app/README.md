# Promote4.me Shopify App

This folder defines the standalone Shopify integration path for restaurants, retail stores, food delivery, package delivery, and proof-of-work fulfillment.

## What the Shopify app does

- Creates Promote4.me jobs from Shopify orders.
- Supports restaurant/food delivery, retail/package delivery, and custom proof-of-work tasks.
- Lets customers track order progress using their order number.
- Lets store managers review delivery/photo/GPS proof inside Promote4.me.
- Supports Shopify app proxy embeds for customer account/order-status pages.

## Required Shopify configuration

Create a Shopify custom app and configure:

- Admin API access scopes:
  - `read_orders`
  - `write_orders` if you want Promote4.me to tag/update orders
  - `read_customers`
  - `read_locations`
- Webhook:
  - `orders/create` → `https://promote4.me/api/webhooks/shopify/order`
  - `orders/updated` → `https://promote4.me/api/webhooks/shopify/order`
- App proxy:
  - Subpath prefix: `apps`
  - Subpath: `promote4me`
  - Proxy URL: `https://promote4.me/shopify/proxy`

## Environment values for production

Store these in the server `.env` file:

```bash
SHOPIFY_API_KEY="..."
SHOPIFY_API_SECRET="..."
SHOPIFY_WEBHOOK_SECRET="..."
SHOPIFY_APP_URL="https://promote4.me"
```

## Current backend endpoints

- `POST /api/webhooks/shopify/order`
- `GET /api/public/jobs/:id`
- `POST /api/jobs`
- `POST /api/jobs/:id/evidence`

The Shopify webhook endpoint is now reserved and ready for the secure order-ingestion implementation. The backend database and job model are already in place.
