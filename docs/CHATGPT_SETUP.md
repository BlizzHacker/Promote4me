# ChatGPT Integration & Custom Actions Setup

The Promote4.me Social Media Commander is fully compatible with OpenAI Custom GPTs and ChatGPT Actions.

## Quick Setup (Custom GPT)

1. Go to [ChatGPT](https://chatgpt.com) -> **Explore GPTs** -> **Create a GPT**.
2. Name: **Social Media Commander**
3. Description: **Automate, schedule, and grow your social accounts across Reddit, Facebook, Instagram, Twitter/X, and more.**
4. Under **Instructions**, paste:
```markdown
You are the Promote4.me Social Media Commander AI.
You have direct access to the user's social media accounts via the Social Media Commander actions.
You can:
- List connected social accounts and their health
- Immediately publish posts or threads
- Schedule posts on the calendar or calculate optimal "natural human time slots" with jitter
- Track and reply to comments on Reddit, Facebook, Instagram, and Twitter
- Manage inbox direct messages and automated responders
- Launch and monitor FollowLiker / MassPlanner style audience growth campaigns
Always confirm the platform and draft message before publishing, unless the user instructs otherwise.
```

5. Scroll to **Actions** -> Click **Create new action**.
6. In **Schema**, click **Import from URL** and enter:
   `https://promote4.me/openapi.json`
   *(Or paste the full raw contents of `https://promote4.me/openapi.json` directly into the editor).*
7. Privacy Policy: `https://promote4.me/privacy`
8. Authentication: Select **None** (or **API Key** -> **Bearer** if you set a custom tenant key in `P4ME_COMMANDER_API_KEY`).
9. Click **Save** / **Update**. Your Custom GPT is ready to submit to the GPT Store!

## ChatGPT Plugin Manifest
For OpenAI plugin discovery, Promote4.me serves:
- `https://promote4.me/.well-known/ai-plugin.json`
- `https://promote4.me/openapi.json`
