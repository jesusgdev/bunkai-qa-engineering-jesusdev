/**
 * KATA Architecture - Environment Variables Configuration
 *
 * SINGLE SOURCE OF TRUTH for all environment variables.
 * This is the ONLY file that should read process.env.
 *
 * Bun automatically loads .env files - no dotenv dependency needed.
 * But the Playwright VSCode extension requires reading process.env as Node.js, so we use loadEnvFile()
 *
 * Usage:
 *   import { config, env } from '@variables';
 */

// Load .env file into process.env (Playwright VSCode extension needs it)
// In CI, env vars come from GitHub Secrets, so .env doesn't exist - hence try/catch
try {
  process.loadEnvFile();
}
catch {
  // .env file doesn't exist (expected in CI environments)
}
// ============================================
// Environment Type Definitions
// ============================================

export type Environment = 'local' | 'staging'; // Add more when needed (e.g., 'production')

/**
 * Role identifiers for role-scoped test users.
 * Active when `TEST_ROLE` is non-empty. Matches the `<ENV>_<ROLE>_EMAIL` /
 * `<ENV>_<ROLE>_PASSWORD` env var pattern (e.g. `STAGING_ADMIN_EMAIL`).
 * Keep in sync with the manifest in `cli/lib/variables-manifest.ts` and the
 * validator in `config/validateTestEnv.ts`.
 */
export type Role = 'admin' | 'owner' | 'member' | 'viewer';
const KNOWN_ROLES: readonly Role[] = ['admin', 'owner', 'member', 'viewer'];

// ============================================
// Destructure Environment Variables (Single Access)
// ============================================

const {
  // === Environment Detection ===
  TEST_ENV = 'local', // Used: env.current, selects URLs and credentials
  TEST_ROLE = '', // Used: env.role, selects which role-scoped user is active (empty = legacy single user)
  CI, // Used: env.isCI (global.setup, KataReporter)
  BUILD_ID, // Used: env.buildId (jiraSync)

  // === Test User Credentials (only current TEST_ENV required) ===
  LOCAL_USER_EMAIL, // Required if TEST_ENV=local
  LOCAL_USER_PASSWORD, // Required if TEST_ENV=local
  STAGING_USER_EMAIL, // Required if TEST_ENV=staging
  STAGING_USER_PASSWORD, // Required if TEST_ENV=staging

  // === TMS Configuration ===
  TMS_PROVIDER = 'xray', // Used: config.tms.provider (jiraSync) - 'xray' | 'jira'
  AUTO_SYNC = 'false', // Used: config.tms.autoSync (jiraSync, global.teardown)

  // === Xray Cloud (required only if TMS_PROVIDER=xray AND AUTO_SYNC=true) ===
  XRAY_CLIENT_ID = '', // Required if AUTO_SYNC=true (jiraSync)
  XRAY_CLIENT_SECRET = '', // Required if AUTO_SYNC=true (jiraSync)
  XRAY_PROJECT_KEY = '', // Used: config.tms.xray.projectKey (jiraSync)

  // === Atlassian credentials (single source of truth) ===
  // Used by MCP, acli, xray-cli, scripts/sync-jira-*.ts, cli/doctor.ts and
  // the Jira-Direct TMS provider. Required only if TMS_PROVIDER=jira AND
  // AUTO_SYNC=true (or when using MCP / acli / scripts locally).
  ATLASSIAN_URL = '',
  ATLASSIAN_EMAIL = '',
  ATLASSIAN_API_TOKEN = '',
  // === Jira-specific operational params (NOT credentials) ===
  JIRA_TEST_STATUS_FIELD = 'customfield_10100', // Used: config.tms.jira.testStatusField

  // === Browser Configuration ===
  HEADLESS = 'true', // Used: config.browser.headless (playwright.config)
  DEFAULT_TIMEOUT = '30000', // Used: config.browser.defaultTimeout (playwright.config, ApiBase)

  // === Reporting Configuration ===
  ALLURE_RESULTS_DIR = './allure-results', // Used: config.reporting.allureResultsDir (playwright.config)
  SCREENSHOT_ON_FAILURE = 'true', // Used: config.reporting.screenshotOnFailure (playwright.config)
  VIDEO_ON_FAILURE = 'true', // Used: config.reporting.videoOnFailure (playwright.config, CI only)
} = process.env;

// ============================================
// Environment Detection
// ============================================

/**
 * Resolve the active TEST_ROLE. We do NOT throw at module load — an invalid
 * role falls back to `null` (legacy single-user mode) and the validator in
 * `config/validateTestEnv.ts` surfaces a clear error. This keeps tooling that
 * imports `env` without needing credentials working even with a typo'd role.
 */
const TEST_ROLE_RAW = (TEST_ROLE || '').trim().toLowerCase();
const activeRole: Role | null
  = TEST_ROLE_RAW && KNOWN_ROLES.includes(TEST_ROLE_RAW as Role)
    ? (TEST_ROLE_RAW as Role)
    : null;

export const env = {
  current: TEST_ENV as Environment,
  role: activeRole,
  isLocal: TEST_ENV === 'local' || TEST_ENV === undefined,
  isStaging: TEST_ENV === 'staging',
  isCI: CI === 'true',
  buildId: BUILD_ID ?? 'local',
} as const;

// ============================================
// Test-User Credentials Mapping (variables from .env)
// After validation, current environment credentials are guaranteed to exist
// ============================================

const userCredentialsMap: Record<Environment, { email: string, password: string }> = {
  local: {
    email: LOCAL_USER_EMAIL ?? '',
    password: LOCAL_USER_PASSWORD ?? '',
  },
  staging: {
    email: STAGING_USER_EMAIL ?? '',
    password: STAGING_USER_PASSWORD ?? '',
  },
};

/**
 * Resolve the active test user for the current environment + role.
 *
 * Resolution priority:
 *   1. `TEST_ROLE` is set AND non-empty → look up `<ENV>_<ROLE>_EMAIL` and
 *      `<ENV>_<ROLE>_PASSWORD` in `process.env` (e.g. `STAGING_ADMIN_EMAIL`).
 *      These vars are NOT destructured at module top (there are 16 of them and
 *      they are dynamic), so we read them via `process.env[...]` at call time.
 *   2. `TEST_ROLE` is empty (default — 100% backwards compatible) → return the
 *      legacy `LOCAL_USER_*` / `STAGING_USER_*` user from `userCredentialsMap`.
 *
 * Empty strings here are NOT a failure — `validateTestEnv.ts` is the gate that
 * errors when a required credential is missing, with a clear var name.
 */
function resolveTestUser(envName: Environment, role: Role | null): { email: string, password: string } {
  if (role) {
    const prefix = `${envName.toUpperCase()}_${role.toUpperCase()}`;
    return {
      email: process.env[`${prefix}_EMAIL`] ?? '',
      password: process.env[`${prefix}_PASSWORD`] ?? '',
    };
  }
  return userCredentialsMap[envName];
}

// ============================================
// ENV DATA Mapping (hardcoded - not secrets because these are not sensitive data like credentials)
// ============================================

const envDataMap: Record<
  Environment,
  { base: string, api: string }
> = {
  local: {
    base: 'http://localhost:3000',
    api: 'http://localhost:3000/api',
  },
  staging: {
    base: 'https://staging-upexbunkai.vercel.app',
    api: 'https://staging-upexbunkai.vercel.app/api',
  },
};
const envData = envDataMap[env.current];
const activeTestUser = resolveTestUser(env.current, activeRole);

// ============================================
// Main Configuration Object
// ============================================

export const config = {
  // URLs - selected by TEST_ENV from urlMap
  baseUrl: envData.base,
  apiUrl: envData.api,

  // Authentication config (UPEX Dojo endpoints - relative to apiUrl)
  auth: {
    loginEndpoint: '/v1/auth/signin',
    tokenEndpoint: '/v1/auth/signin', // Endpoint to intercept for token (used by page.waitForResponse)
    meEndpoint: '/v1/me',
    tokenLifetimeSeconds: 86400, // 24 hours (1 day)
    // Storage paths for authenticated sessions
    storageStatePath: '.auth/user.json',
    apiStatePath: '.auth/api-state.json',
  },

  // Test User (configure in .env)
  testUser: activeTestUser,

  // TMS
  tms: {
    provider: TMS_PROVIDER as 'xray' | 'jira' | 'none',
    autoSync: AUTO_SYNC === 'true',
    xray: {
      clientId: XRAY_CLIENT_ID,
      clientSecret: XRAY_CLIENT_SECRET,
      projectKey: XRAY_PROJECT_KEY,
    },
    jira: {
      url: ATLASSIAN_URL,
      user: ATLASSIAN_EMAIL,
      apiToken: ATLASSIAN_API_TOKEN,
      testStatusField: JIRA_TEST_STATUS_FIELD,
    },
  },

  // Browser
  browser: {
    headless: HEADLESS !== 'false',
    defaultTimeout: Number.parseInt(DEFAULT_TIMEOUT, 10),
  },

  // Reporting
  reporting: {
    allureResultsDir: ALLURE_RESULTS_DIR,
    screenshotOnFailure: SCREENSHOT_ON_FAILURE !== 'false',
    videoOnFailure: VIDEO_ON_FAILURE !== 'false',
  },
} as const;
