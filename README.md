# Promote4.me 2.0 Delivery Monitor & Social Media Commander

Promote4.me has been rebuilt from the legacy PHP / AngularJS project into a modern delivery monitoring product with an autonomous AI Social Media Commander.

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

The legacy PHP/AngularJS tree (`api/`, `admin/`, `bot/`, `mobile/`, `p4invite/`)
has been removed from the working tree: it contained hardcoded database
credentials and outdated auth patterns. Those credentials remain reachable in
git history and must be treated as burned — rotate them at the hosting
provider before anything else. Details in `docs/legacy-audit.md`.

## Social Media Commander MCP (Claude / ChatGPT / Antigravity / Forgeverse)

Promote4.me now features a full **Social Media Commander MCP Server**, enabling users and autonomous AI agents (Hermes, Qwen, Deepseek, Claude, Codex, Gemini, Antigravity) to:
- **Automate & Calendar Posts**: Broadcast immediately or schedule in optimal "natural human time slots" with jitter across Reddit, Facebook, Instagram, Twitter/X, Discord, YouTube, TikTok, Bluesky, Telegram.
- **Comment Management & Auto-Reply**: Track incoming comments, moderate, and auto-reply using keyword rules or AI instructions.
- **Direct Message Inbox**: Manage inbound DMs and send automated greeting/follow-up sequences.
- **FollowLiker / MassPlanner Automation**: Run audience growth campaigns with safe daily caps, human delays, and proxy support.

### Protocols & Connectors
- **MCP Endpoint (HTTP & SSE)**: `https://promote4.me/api/commander/mcp` and `https://promote4.me/mcp`
- **MCP Stdio CLI**: `node bin/commander-mcp.js`
- **ChatGPT Custom Actions**: `https://promote4.me/openapi.json` & `https://promote4.me/.well-known/ai-plugin.json`
- **Forgeverse**: Pre-registered under MCP Servers as `mcp_promote4me_commander`.

See `docs/` for quickstart setup guides:
- [ChatGPT Actions Setup](docs/CHATGPT_SETUP.md)
- [Claude Desktop & Claude Code Setup](docs/CLAUDE_SETUP.md)
- [Antigravity IDE & CLI Setup](docs/ANTIGRAVITY_MCP_SETUP.md)
- [Hermes, Qwen & Deepseek Setup](docs/HERMES_QWEN_DEEPSEEK_SETUP.md)
- [Social Commander Manual](docs/SOCIAL_COMMANDER_MANUAL.md)
