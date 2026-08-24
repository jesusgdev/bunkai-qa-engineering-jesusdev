/**
 * @fileoverview Contract-level validation for agent compatibility: hook adapters
 * across harnesses and MCP server parity. These are read-only checks that return
 * error strings — callers decide whether to repair or report.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// Hook compatibility
// ---------------------------------------------------------------------------

/**
 * Validates that hook adapter files exist for each configured harness and
 * contain consistent configuration. Returns an array of error strings
 * (empty = all hooks compatible).
 */
export function validateHookCompatibility(root: string): string[] {
  const errors: string[] = [];

  const claudeSettings = join(root, '.claude', 'settings.json');
  const opencodePlugins = join(root, '.opencode', 'plugins');
  const codexHooks = join(root, '.codex', 'hooks.json');
  const codexConfig = join(root, '.codex', 'config.toml');

  // Claude hooks — check settings.json exists and has hooks section
  if (existsSync(claudeSettings)) {
    try {
      const config = JSON.parse(readFileSync(claudeSettings, 'utf8'));
      if (!config.hooks && !config.preCommit) {
        // Hooks are optional — this is informational, not an error
      }
    }
    catch {
      errors.push('.claude/settings.json: invalid JSON');
    }
  }

  // OpenCode plugins — check plugin directory exists
  if (existsSync(opencodePlugins)) {
    try {
      const plugins = readdirSync(opencodePlugins).filter((f: string) => f.endsWith('.js') || f.endsWith('.mjs'));
      if (plugins.length === 0) {
        errors.push('opencode.jsonc: .opencode/plugins directory is empty');
      }
    }
    catch {
      errors.push('opencode.jsonc: cannot read .opencode/plugins');
    }
  }

  // Codex hooks — check hooks.json exists
  if (existsSync(codexHooks)) {
    try {
      const hooks = JSON.parse(readFileSync(codexHooks, 'utf8'));
      if (!hooks || typeof hooks !== 'object') {
        errors.push('.codex/hooks.json: invalid format');
      }
    }
    catch {
      errors.push('.codex/hooks.json: invalid JSON');
    }
  }

  // Codex config — check config.toml exists and is valid TOML
  if (existsSync(codexConfig)) {
    try {
      const content = readFileSync(codexConfig, 'utf8');
      // Basic TOML validation — just check it's not empty and has some structure
      if (!content.trim()) {
        errors.push('.codex/config.toml: file is empty');
      }
    }
    catch {
      errors.push('.codex/config.toml: cannot read file');
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// MCP parity
// ---------------------------------------------------------------------------

/** Expected MCP server names that should be configured across all harnesses. */
const EXPECTED_MCP_SERVERS = [
  'context7',
  'engram',
  'postman',
  'dbhub',
  'playwright',
  'tavily',
];

/**
 * Validates that MCP server configurations exist across Claude, OpenCode, and
 * Codex with consistent server names. Returns an array of error strings
 * (empty = full parity).
 */
export function validateMcpParity(root: string): string[] {
  const errors: string[] = [];

  const claudeMcp = join(root, '.mcp.json');
  const opencodeMcp = join(root, 'opencode.jsonc');
  const codexConfig = join(root, '.codex', 'config.toml');

  // Parse Claude MCP servers
  const claudeServers = new Set<string>();
  if (existsSync(claudeMcp)) {
    try {
      const config = JSON.parse(readFileSync(claudeMcp, 'utf8'));
      for (const key of Object.keys(config.mcpServers ?? {})) {
        claudeServers.add(key);
      }
    }
    catch {
      errors.push('.mcp.json: invalid JSON');
    }
  }

  // Parse OpenCode MCP servers
  const opencodeServers = new Set<string>();
  if (existsSync(opencodeMcp)) {
    try {
      const content = readFileSync(opencodeMcp, 'utf8');
      // Strip JSONC comments before parsing
      const stripped = content.replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      const config = JSON.parse(stripped);
      for (const key of Object.keys(config.mcpServers ?? {})) {
        opencodeServers.add(key);
      }
    }
    catch {
      errors.push('opencode.jsonc: invalid JSON');
    }
  }

  // Parse Codex MCP servers (from config.toml)
  const codexServers = new Set<string>();
  if (existsSync(codexConfig)) {
    try {
      const content = readFileSync(codexConfig, 'utf8');
      // Basic TOML parsing for MCP server names
      const serverMatches = content.match(/\[mcp\.servers\.[^\]]+\]/g);
      if (serverMatches) {
        for (const match of serverMatches) {
          const name = match.match(/\.[^\]]+$/)?.[0];
          if (name) { codexServers.add(name.split('.').pop() ?? name); }
        }
      }
    }
    catch {
      errors.push('.codex/config.toml: cannot read file');
    }
  }

  // Check parity — each expected server should be in all three harnesses
  for (const server of EXPECTED_MCP_SERVERS) {
    if (!claudeServers.has(server)) {
      errors.push(`MCP parity: server '${server}' missing from .mcp.json`);
    }
    if (!opencodeServers.has(server)) {
      errors.push(`MCP parity: server '${server}' missing from opencode.jsonc`);
    }
    if (!codexServers.has(server)) {
      errors.push(`MCP parity: server '${server}' missing from .codex/config.toml`);
    }
  }

  return errors;
}
