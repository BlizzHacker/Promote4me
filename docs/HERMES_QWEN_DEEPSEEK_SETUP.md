# Universal AI Agent Integration (Hermes / Qwen / Deepseek / Codex / Gemini / Kimi / Mimo)

The Social Media Commander is completely model-agnostic. Any open-weights or API-based agent can control your social channels.

## 1. Hermes Agent / OpenCode / Hermes-Server
In your agent's MCP connectors (`~/.hermes/mcp.json` or config):
```json
{
  "servers": {
    "promote4me": {
      "type": "http",
      "url": "http://192.168.0.151/api/commander/mcp"
    }
  }
}
```

## 2. Qwen & DeepSeek (via Ollama / vLLM / LiteLLM / OpenWebUI)
Point OpenWebUI or LiteLLM Tool Callers to:
- **Endpoint**: `http://192.168.0.151/api/commander/mcp`
- **Method**: Standard JSON-RPC 2.0 or OpenAPI 3.1 schema at `http://192.168.0.151/openapi.json`.

## 3. Forgeverse
In Forgeverse Workspace (`src/site/fv/providers.json`):
- `mcp_promote4me_commander` is pre-registered in the **MCP servers** group.
- Select the provider in Forgeverse to enable live social commander tool calling inside your 3D and media pipelines!
