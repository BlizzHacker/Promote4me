#!/usr/bin/env node
/**
 * Promote4.me Social Media Commander - Stdio MCP CLI
 * Can be run via Claude Desktop, Antigravity CLI, or any stdio MCP harness:
 * node /opt/promote4me/app/bin/commander-mcp.js
 */
import readline from 'readline';
import { handleRpcRequest } from '../server/mcp/commander-mcp.js';
import { migrate } from '../server/db.js';

// Ensure tables exist
migrate();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const req = JSON.parse(trimmed);
    const tenantId = process.env.P4ME_TENANT_ID || '';
    const res = await handleRpcRequest(req, tenantId);
    if (res !== null) {
      process.stdout.write(JSON.stringify(res) + '\n');
    }
  } catch (err) {
    const errRes = {
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: `Parse error: ${err.message}` },
    };
    process.stdout.write(JSON.stringify(errRes) + '\n');
  }
});
