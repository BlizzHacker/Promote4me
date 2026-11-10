# Claude Desktop & Claude Code Setup

Connect Claude directly to Promote4.me Social Media Commander via the Model Context Protocol (MCP).

## Claude Desktop Configuration

Open your Claude Desktop configuration file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### Stdio Mode (Direct Server or SSH)
```json
{
  "mcpServers": {
    "promote4me-commander": {
      "command": "ssh",
      "args": [
        "-o", "StrictHostKeyChecking=no",
        "root@192.168.0.6",
        "ssh -o StrictHostKeyChecking=no root@192.168.0.151 'node /opt/promote4me/app/bin/commander-mcp.js'"
      ]
    }
  }
}
```

### Direct Local/Cluster Node Mode
If running on the same host or container:
```json
{
  "mcpServers": {
    "promote4me-commander": {
      "command": "node",
      "args": ["/opt/promote4me/app/bin/commander-mcp.js"]
    }
  }
}
```

## HTTP / SSE Mode
```json
{
  "mcpServers": {
    "promote4me-commander": {
      "url": "http://192.168.0.151/api/commander/mcp"
    }
  }
}
```

Restart Claude Desktop, and all 17 Social Media Commander tools will appear in your tool menu!
