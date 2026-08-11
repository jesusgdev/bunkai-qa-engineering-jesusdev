#!/usr/bin/env bun
/**
 * API Login CLI - Authentication Token Generator
 *
 * Authenticates against the project API and stores the token for:
 *   1. Playwright tests  → .auth/api-state.json
 *   2. OpenAPI MCP tools → .env (API_TOKEN var, consumed at MCP-server spawn
 *      via .mcp.json `${API_TOKEN}` and opencode.jsonc `{env:API_TOKEN}`)
 *
 * After running this command, RESTART the terminal session before re-launching
 * Claude Code or OpenCode — MCP servers cache env vars at spawn time.
 *
 * Usage:
 *   bun run api:login                 # Uses TEST_ENV from .env (default: local)
 *   bun run api:login local           # Authenticate against local environment
 *   bun run api:login staging         # Authenticate against staging environment
 *   bun run api:login --help          # Show help
 *
 * Environment URLs, credentials, and auth endpoints are sourced from
 * config/variables.ts (single source of truth). See that file to add
 * new environments or change URLs.
 */

import type { ApiState } from '@data/types';

import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ============================================
// Logging (must be defined early for validation errors)
// ============================================

const PREFIX = '[api-login]';

function log(msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') {
  const icons = { info: '\u2139', success: '\u2713', warn: '\u26A0', error: '\u2717' };
  const colors = { info: '\x1B[36m', success: '\x1B[32m', warn: '\x1B[33m', error: '\x1B[31m' };
  console.log(`${colors[type]}${icons[type]}\x1B[0m ${PREFIX} ${msg}`);
}

// ============================================
// CLI Argument Parsing (BEFORE config import)
// ============================================

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Valid values — must match Environment type in config/variables.ts and
// Role type respectively.
const validEnvs = ['local', 'staging'];
const validRoles = ['admin', 'owner', 'member', 'viewer'];

// Parse `--role <value>` (space-separated) anywhere in args.
let roleFlag: string | undefined;
const roleIdx = args.indexOf('--role');
if (roleIdx !== -1) {
  roleFlag = args[roleIdx + 1];
  if (!roleFlag) {
    log('--role requires a value', 'error');
    log(`Available roles: ${validRoles.join(', ')}`, 'info');
    process.exit(1);
  }
  args.splice(roleIdx, 2);
}
// Also accept `--role=<value>` (single-token form).
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--role=')) {
    roleFlag = args[i].slice('--role='.length);
    args.splice(i, 1);
    break;
  }
}

if (roleFlag) {
  const roleLower = roleFlag.toLowerCase();
  if (!validRoles.includes(roleLower)) {
    log(`Unknown role: "${roleFlag}"`, 'error');
    log(`Available roles: ${validRoles.join(', ')}`, 'info');
    process.exit(1);
  }
  // Override TEST_ROLE BEFORE importing config, because config/variables.ts
  // reads TEST_ROLE at evaluation time.
  process.env.TEST_ROLE = roleLower;
}

// Validate and override TEST_ENV BEFORE importing config,
// because config/variables.ts reads TEST_ENV at evaluation time.
const envArg = args[0];
if (envArg) {
  if (!validEnvs.includes(envArg)) {
    log(`Unknown environment: "${envArg}"`, 'error');
    log(`Available environments: ${validEnvs.join(', ')}`, 'info');
    process.exit(1);
  }
  process.env.TEST_ENV = envArg;
}

// Dynamic import: config/variables.ts reads TEST_ENV at evaluation time,
// so we must set it above BEFORE this import runs.
const { config, env } = await import('@variables');

// ============================================
// Constants
// ============================================

const PROJECT_ROOT = resolve(import.meta.dir, '..');
const ENV_FILE = resolve(PROJECT_ROOT, '.env');
const ENV_TOKEN_KEY = 'API_TOKEN';

// ╔══════════════════════════════════════════════════════════════════╗
// ║  PROJECT-SPECIFIC AUTHENTICATION CONFIGURATION                  ║
// ║  Adapt this section to match YOUR project's auth mechanism.     ║
// ║  The boilerplate default uses POST /auth/login with             ║
// ║  { email, password } → { access_token }.                       ║
// ║  Your project may use OAuth2, API keys, or a different format.  ║
// ╚══════════════════════════════════════════════════════════════════╝

/**
 * Build the request body for the auth endpoint.
 * Override this for different auth formats (e.g., { username, password }, OAuth2 form data).
 */
function buildAuthPayload(email: string, password: string): Record<string, string> {
  return { email, password };
}

/**
 * Extract token fields from the auth response.
 * Override this if your API returns tokens in a different shape.
 *
 * Expected response format (default):
 *   { access_token: string, token_type: string, expires_in: number, refresh_token?: string }
 */
function extractTokenFromResponse(body: Record<string, unknown>): {
  accessToken: string
  tokenType: string
  expiresIn: number
  refreshToken: string | null
} {
  // Bunkai auth returns a PAT: { pat: { token }, session, user }.
  const pat = body.pat as { token?: string } | undefined;
  const token = pat?.token ?? body.access_token ?? '';
  return {
    accessToken: String(token),
    tokenType: String(body.token_type ?? 'Bearer'),
    expiresIn: Number(body.expires_in ?? 86400),
    refreshToken: body.refresh_token ? String(body.refresh_token) : null,
  };
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  END OF PROJECT-SPECIFIC CONFIGURATION                          ║
// ╚══════════════════════════════════════════════════════════════════╝

// ============================================
// Authentication
// ============================================

async function authenticate(): Promise<ApiState | null> {
  const url = `${config.apiUrl}${config.auth.loginEndpoint}`;
  const { email, password } = config.testUser;

  if (!email || !password) {
    const envPrefix = env.current.toUpperCase();
    // When a role is active, the expected var names are role-scoped
    // (`<ENV>_<ROLE>_EMAIL`); otherwise legacy (`<ENV>_USER_EMAIL`).
    const emailVar = env.role
      ? `${envPrefix}_${env.role.toUpperCase()}_EMAIL`
      : `${envPrefix}_USER_EMAIL`;
    const passwordVar = env.role
      ? `${envPrefix}_${env.role.toUpperCase()}_PASSWORD`
      : `${envPrefix}_USER_PASSWORD`;
    log('Missing credentials in .env file:', 'error');
    if (!email) { log(`  - ${emailVar} is not set`, 'error'); }
    if (!password) { log(`  - ${passwordVar} is not set`, 'error'); }
    log('Set these in your .env file and try again.', 'info');
    return null;
  }

  log(`Authenticating against ${url}...`);

  try {
    const payload = buildAuthPayload(email, password);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      log(`Authentication failed with status ${response.status}`, 'error');
      log(`Response: ${body}`, 'error');
      return null;
    }

    const responseBody = (await response.json()) as Record<string, unknown>;
    const tokenData = extractTokenFromResponse(responseBody);

    if (!tokenData.accessToken) {
      log('Authentication response did not contain an access token.', 'error');
      log(`Response keys: ${Object.keys(responseBody).join(', ')}`, 'error');
      return null;
    }

    return {
      token: tokenData.accessToken,
      tokenType: tokenData.tokenType,
      expiresIn: tokenData.expiresIn,
      refreshToken: tokenData.refreshToken,
      source: 'api-login',
      createdAt: new Date().toISOString(),
    };
  }
  catch (error) {
    log('Connection failed. Is the server running?', 'error');
    log(`  ${String(error)}`, 'error');
    return null;
  }
}

// ============================================
// Token Storage: api-state.json
// ============================================

function saveApiState(apiState: ApiState): void {
  const apiStatePath = config.auth.apiStatePath;
  writeFileSync(apiStatePath, JSON.stringify(apiState, null, 2));
  log(`Token saved to ${apiStatePath}`, 'success');
}

// ============================================
// Token Storage: .env (consumed by MCP servers at spawn)
// ============================================
//
// Both .mcp.json (Claude Code) and opencode.jsonc (OpenCode) reference the
// API_TOKEN env var via expansion (`${API_TOKEN}` and `{env:API_TOKEN}`).
// We only need to keep .env in sync — never write secrets into the committed
// config files. After this runs, the user must restart their terminal
// session so MCP servers pick up the new value at spawn time.

function updateEnvFile(token: string): void {
  if (!existsSync(ENV_FILE)) {
    log(`.env not found at ${ENV_FILE} — copy .env.example to .env first.`, 'error');
    log('Token saved to .auth/api-state.json only. MCP servers will not see it.', 'warn');
    return;
  }

  const raw = readFileSync(ENV_FILE, 'utf-8');
  const trailingNewline = raw.endsWith('\n');
  const lines = raw.split('\n');
  const linePattern = new RegExp(`^${ENV_TOKEN_KEY}\\s*=`);
  const replacement = `${ENV_TOKEN_KEY}=${token}`;

  let replaced = false;
  const updated = lines.map((line) => {
    if (linePattern.test(line)) {
      replaced = true;
      return replacement;
    }
    return line;
  });

  if (!replaced) {
    if (trailingNewline) {
      // Drop the empty trailing element split() produced, append new line, restore newline.
      if (updated[updated.length - 1] === '') {
        updated.pop();
      }
      updated.push(replacement);
      updated.push('');
    }
    else {
      updated.push(replacement);
    }
  }

  const tmpFile = `${ENV_FILE}.tmp`;
  writeFileSync(tmpFile, updated.join('\n'));
  renameSync(tmpFile, ENV_FILE);
  log(`Token saved to .env (${ENV_TOKEN_KEY})`, 'success');
}

// ============================================
// Help
// ============================================

function showHelp(): void {
  console.log(`
\x1B[1mAPI Login\x1B[0m - Authenticate and store token for tests & MCP tools

\x1B[1mUSAGE\x1B[0m
  bun run api:login [environment] [--role <role>]

\x1B[1mENVIRONMENTS\x1B[0m
  local       Authenticate against local dev server (default)
  staging     Authenticate against staging server

\x1B[1mROLES\x1B[0m
  --role <role>   Override TEST_ROLE for this run (reads <ENV>_<ROLE>_EMAIL /
                  <ENV>_<ROLE>_PASSWORD from .env instead of the legacy
                  LOCAL_USER_* / STAGING_USER_*). If omitted, TEST_ROLE from
                  .env (or the shell) is used.
                  Valid roles: admin, owner, member, viewer

\x1B[1mEXAMPLES\x1B[0m
  bun run api:login                          # Uses TEST_ENV + TEST_ROLE from .env
  bun run api:login local                    # Force local env, role from .env
  bun run api:login staging                  # Force staging env, role from .env
  bun run api:login --role admin             # Force admin role, env from .env
  bun run api:login staging --role admin     # staging-admin@... credentials
  bun run api:login --role=member local      # local-member@... credentials

\x1B[1mTOKEN STORAGE\x1B[0m
  .auth/api-state.json    Used by Playwright test fixtures
  .env (API_TOKEN)        Read by .mcp.json (\${API_TOKEN}) and
                          opencode.jsonc ({env:API_TOKEN}) at MCP-server spawn.
                          RESTART your terminal after login so MCPs pick it up.

\x1B[1mREQUIRED .env VARIABLES\x1B[0m
  Legacy single-user mode (TEST_ROLE empty):
    For local:    LOCAL_USER_EMAIL, LOCAL_USER_PASSWORD
    For staging:  STAGING_USER_EMAIL, STAGING_USER_PASSWORD

  Role-scoped mode (TEST_ROLE=<role>):
    For local:    LOCAL_<ROLE>_EMAIL, LOCAL_<ROLE>_PASSWORD
    For staging:  STAGING_<ROLE>_EMAIL, STAGING_<ROLE>_PASSWORD
    e.g. TEST_ROLE=admin + TEST_ENV=staging → STAGING_ADMIN_EMAIL / _PASSWORD

\x1B[1mCONFIGURATION\x1B[0m
  Environment URLs:   config/variables.ts (envDataMap)
  Auth format:        scripts/api-login.ts (PROJECT-SPECIFIC section)
  Role list:          config/variables.ts (KNOWN_ROLES) + validateTestEnv.ts

\x1B[1mOPTIONS\x1B[0m
  -h, --help          Show this help
  --role <role>       Authenticate as <role> for this run only
`);
}

// ============================================
// Main Execution
// ============================================

console.log(`\n\x1B[1mAPI Login\x1B[0m — ${env.current}${env.role ? ` / ${env.role}` : ''}\n`);

log(`User: ${config.testUser.email}`);

// 1. Authenticate
const apiState = await authenticate();
if (!apiState) {
  process.exit(1);
}

log('Authentication successful', 'success');
log(`Token type: ${apiState.tokenType}`);
log(`Expires in: ${apiState.expiresIn} seconds`);

// 2. Save token to api-state.json
saveApiState(apiState);

// 3. Sync API_TOKEN into .env so MCP servers pick it up at next spawn.
updateEnvFile(apiState.token);

console.log('\n\x1B[32m\u2713 Login completed!\x1B[0m');
console.log('\n\x1B[33m\u26A0\x1B[0m  RESTART your terminal session before re-launching Claude Code or OpenCode.');
console.log('   MCP servers cache env vars at spawn time \u2014 they will not pick up the');
console.log('   new API_TOKEN until the parent shell is restarted.\n');
