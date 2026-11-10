# Antigravity IDE & CLI Setup

Antigravity natively supports the Model Context Protocol.

## Antigravity MCP Configuration

Add this entry to your Antigravity MCP settings (`mcp_servers.json` or through Antigravity Customizations):

```json
{
  "mcpServers": {
    "promote4me-commander": {
      "url": "http://192.168.0.151/api/commander/mcp"
    }
  }
}
```

Or for SSH-based stdio transport:
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

Once loaded, Antigravity will have instant access to:
- `social_list_accounts`
- `social_post_now`
- `social_schedule_post`
- `social_get_calendar`
- `social_get_comments`
- `social_reply_comment`
- `social_send_message`
- `social_start_campaign`
- `social_check_limits`
