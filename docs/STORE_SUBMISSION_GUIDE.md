# Social Media Commander - Store Submission & Discovery Guide

This guide covers how users and AI agents discover and install the Promote4.me Social Media Commander across **Claude**, **ChatGPT**, **Antigravity**, and **Hermes**.

---

## 1. Claude Desktop & Claude Code (Smithery / Glama / Anthropic MCP Registry)

### Option A: Smithery Registry (Global One-Click CLI)
The server includes `smithery.yaml`. Any Claude user can install it by running:
```bash
npx -y @smithery/cli install @blizzhacker/promote4me-social-commander --client claude
```
- Registry: Listed on [Smithery.ai](https://smithery.ai) under Productivity / Social Media.

### Option B: Official Anthropic Model Context Protocol Registry
- Manifest: `mcp.json` is ready in the repository root.
- To publish to the official Anthropic servers catalog, submit a Pull Request to [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) referencing `mcp.json`.

### Option C: Direct Claude Desktop Config
Users add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "promote4me-commander": {
      "url": "https://promote4.me/api/commander/mcp"
    }
  }
}
```

---

## 2. ChatGPT (OpenAI GPT Store & Custom Actions)

The Social Media Commander is fully prepared for publication to the **OpenAI GPT Store**:
1. **Public OpenAPI 3.1 Spec**: `https://promote4.me/openapi.json`
2. **Plugin Manifest**: `https://promote4.me/.well-known/ai-plugin.json`
3. **Live Verified Policy URLs**:
   - Privacy Policy: `https://promote4.me/privacy.html`
   - Terms of Service: `https://promote4.me/terms.html`
4. **Publishing in GPT Builder**:
   - In ChatGPT -> *Explore GPTs* -> *Create*.
   - Add Action: Import `https://promote4.me/openapi.json`.
   - Set visibility to **Public** -> Select category **Productivity / Marketing**.
   - Your GPT is live on the GPT Store for hundreds of millions of ChatGPT users.

---

## 3. Antigravity IDE & Marketplace

### Installed Local Plugin
Installed locally in:
`~/.gemini/config/plugins/promote4me-commander/`

### Global Marketplace Package
The bundle is distributed inside `antigravity-plugin/`:
- `plugin.json`
- `mcp_config.json`
- `skills/social-commander/SKILL.md`
- `rules/AGENTS.md`
- `README.md`

Users install via Antigravity Marketplace or by placing the bundle in their plugins directory.

---

## 4. Hermes (Nous Research / OpenCode / Local AI Models)

### Installed Skill & Agent
- Skill: `~/.hermes/skills/social-commander/SKILL.md`
- Agent: `~/.hermes/agents/social-commander.md`
- Tool Manifest: `hermes-agent.json`

Hermes agents automatically detect the skill and invoke `http://192.168.0.151/api/commander/mcp` to autonomously plan and execute campaigns.
