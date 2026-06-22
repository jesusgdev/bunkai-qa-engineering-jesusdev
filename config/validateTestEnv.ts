/**
 * KATA Architecture - Test Environment Variables Validator
 *
 * Validates required runtime variables for the active test environment:
 * - Credentials: Only for current TEST_ENV (local or staging)
 *   - If TEST_ROLE is set: validates `<ENV>_<ROLE>_EMAIL` / `_PASSWORD`
 *     (e.g. STAGING_ADMIN_EMAIL when TEST_ENV=staging AND TEST_ROLE=admin)
 *   - If TEST_ROLE is empty: validates the legacy `LOCAL_USER_*` / `STAGING_USER_*`
 * - TMS: Only if AUTO_SYNC=true (validates Xray or Jira based on TMS_PROVIDER)
 *
 * Usage:
 *   - Importable: call validateTestEnvironment(vars) with pre-extracted env vars
 *   - Standalone: bun run config/validateTestEnv.ts
 */

/** Known role slugs — keep in sync with `config/variables.ts` `Role` type. */
const KNOWN_ROLES = ['admin', 'owner', 'member', 'viewer'] as const;
type Role = (typeof KNOWN_ROLES)[number];

/** Variables needed for validation (subset of all env vars) */
export interface EnvVarsToValidate {
  TEST_ENV: string
  TEST_ROLE?: string
  AUTO_SYNC: string
  TMS_PROVIDER?: string
  LOCAL_USER_EMAIL?: string
  LOCAL_USER_PASSWORD?: string
  STAGING_USER_EMAIL?: string
  STAGING_USER_PASSWORD?: string
  // Role-scoped credentials (read via process.env in variables.ts; validator
  // receives them explicitly to avoid a second process.env crawl).
  [key: `${Uppercase<string>}_${Uppercase<string>}_${'EMAIL' | 'PASSWORD'}`]: string | undefined
  XRAY_CLIENT_ID?: string
  XRAY_CLIENT_SECRET?: string
  ATLASSIAN_URL?: string
  ATLASSIAN_EMAIL?: string
  ATLASSIAN_API_TOKEN?: string
}

/**
 * Validates test environment variables.
 * Throws Error if validation fails (fail-fast).
 *
 * @param vars - Pre-extracted environment variables (avoids multiple process.env reads)
 */
export function validateTestEnvironment(vars: EnvVarsToValidate): void {
  const errors: string[] = [];

  // Validate TEST_ENV value first — credential var names depend on it.
  const validEnvs = ['local', 'staging'];
  if (!validEnvs.includes(vars.TEST_ENV)) {
    errors.push(`Unknown TEST_ENV: ${vars.TEST_ENV}. Valid values: local, staging`);
    // Skip credential validation — var names would be meaningless.
    if (errors.length > 0) {
      throw new Error(`Test environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`);
    }
  }

  // Resolve active TEST_ROLE (case-insensitive, trimmed).
  const roleRaw = (vars.TEST_ROLE ?? '').trim().toLowerCase();
  let activeRole: Role | null = null;
  if (roleRaw) {
    if (!KNOWN_ROLES.includes(roleRaw as Role)) {
      errors.push(
        `Unknown TEST_ROLE: "${vars.TEST_ROLE}". Valid values: ${KNOWN_ROLES.join(', ')} (or empty for legacy single-user mode).`,
      );
      // Fall through to legacy credential check — it will likely also fail,
      // surfacing the missing var name, which is more actionable than a
      // generic "TEST_ROLE invalid" with no credential context.
    }
    else {
      activeRole = roleRaw as Role;
    }
  }

  // Validate credentials for the CURRENT environment + role.
  if (activeRole) {
    // Role-scoped: validate `<ENV>_<ROLE>_EMAIL` / `_PASSWORD`.
    const envUpper = vars.TEST_ENV.toUpperCase();
    const roleUpper = activeRole.toUpperCase();
    const emailKey = `${envUpper}_${roleUpper}_EMAIL`;
    const passwordKey = `${envUpper}_${roleUpper}_PASSWORD`;
    // Cast to a record for dynamic key access — the interface's template-literal
    // index signature doesn't accept a plain `string` key directly.
    const roleVars = vars as unknown as Record<string, string | undefined>;
    const email = roleVars[emailKey];
    const password = roleVars[passwordKey];
    if (!email) {
      errors.push(`${emailKey} is required for TEST_ENV=${vars.TEST_ENV} AND TEST_ROLE=${activeRole}`);
    }
    if (!password) {
      errors.push(`${passwordKey} is required for TEST_ENV=${vars.TEST_ENV} AND TEST_ROLE=${activeRole}`);
    }
  }
  else {
    // Legacy single-user: validate `LOCAL_USER_*` / `STAGING_USER_*`.
    if (vars.TEST_ENV === 'local') {
      if (!vars.LOCAL_USER_EMAIL) {
        errors.push('LOCAL_USER_EMAIL is required for TEST_ENV=local');
      }
      if (!vars.LOCAL_USER_PASSWORD) {
        errors.push('LOCAL_USER_PASSWORD is required for TEST_ENV=local');
      }
    }
    else if (vars.TEST_ENV === 'staging') {
      if (!vars.STAGING_USER_EMAIL) {
        errors.push('STAGING_USER_EMAIL is required for TEST_ENV=staging');
      }
      if (!vars.STAGING_USER_PASSWORD) {
        errors.push('STAGING_USER_PASSWORD is required for TEST_ENV=staging');
      }
    }
  }

  // Validate TMS config only if AUTO_SYNC=true
  if (vars.AUTO_SYNC === 'true') {
    const provider = vars.TMS_PROVIDER || 'xray';

    if (provider === 'xray') {
      if (!vars.XRAY_CLIENT_ID) {
        errors.push('XRAY_CLIENT_ID is required when AUTO_SYNC=true and TMS_PROVIDER=xray');
      }
      if (!vars.XRAY_CLIENT_SECRET) {
        errors.push('XRAY_CLIENT_SECRET is required when AUTO_SYNC=true and TMS_PROVIDER=xray');
      }
    }
    else if (provider === 'jira') {
      if (!vars.ATLASSIAN_URL) {
        errors.push('ATLASSIAN_URL is required when AUTO_SYNC=true and TMS_PROVIDER=jira');
      }
      if (!vars.ATLASSIAN_EMAIL) {
        errors.push('ATLASSIAN_EMAIL is required when AUTO_SYNC=true and TMS_PROVIDER=jira');
      }
      if (!vars.ATLASSIAN_API_TOKEN) {
        errors.push('ATLASSIAN_API_TOKEN is required when AUTO_SYNC=true and TMS_PROVIDER=jira');
      }
    }
    else {
      errors.push(`Unknown TMS_PROVIDER: ${provider}. Valid values: xray, jira`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Test environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`);
  }
}

// Standalone execution: bun run config/validateTestEnv.ts
if (import.meta.main) {
  // Only standalone mode reads process.env directly
  const vars: EnvVarsToValidate = {
    TEST_ENV: process.env.TEST_ENV || 'local',
    TEST_ROLE: process.env.TEST_ROLE || '',
    AUTO_SYNC: process.env.AUTO_SYNC || 'false',
    TMS_PROVIDER: process.env.TMS_PROVIDER || 'xray',
    LOCAL_USER_EMAIL: process.env.LOCAL_USER_EMAIL,
    LOCAL_USER_PASSWORD: process.env.LOCAL_USER_PASSWORD,
    STAGING_USER_EMAIL: process.env.STAGING_USER_EMAIL,
    STAGING_USER_PASSWORD: process.env.STAGING_USER_PASSWORD,
    // Role-scoped credentials (all 16, read dynamically so the validator sees
    // whichever one the active TEST_ENV + TEST_ROLE selects).
    LOCAL_ADMIN_EMAIL: process.env.LOCAL_ADMIN_EMAIL,
    LOCAL_ADMIN_PASSWORD: process.env.LOCAL_ADMIN_PASSWORD,
    LOCAL_OWNER_EMAIL: process.env.LOCAL_OWNER_EMAIL,
    LOCAL_OWNER_PASSWORD: process.env.LOCAL_OWNER_PASSWORD,
    LOCAL_MEMBER_EMAIL: process.env.LOCAL_MEMBER_EMAIL,
    LOCAL_MEMBER_PASSWORD: process.env.LOCAL_MEMBER_PASSWORD,
    LOCAL_VIEWER_EMAIL: process.env.LOCAL_VIEWER_EMAIL,
    LOCAL_VIEWER_PASSWORD: process.env.LOCAL_VIEWER_PASSWORD,
    STAGING_ADMIN_EMAIL: process.env.STAGING_ADMIN_EMAIL,
    STAGING_ADMIN_PASSWORD: process.env.STAGING_ADMIN_PASSWORD,
    STAGING_OWNER_EMAIL: process.env.STAGING_OWNER_EMAIL,
    STAGING_OWNER_PASSWORD: process.env.STAGING_OWNER_PASSWORD,
    STAGING_MEMBER_EMAIL: process.env.STAGING_MEMBER_EMAIL,
    STAGING_MEMBER_PASSWORD: process.env.STAGING_MEMBER_PASSWORD,
    STAGING_VIEWER_EMAIL: process.env.STAGING_VIEWER_EMAIL,
    STAGING_VIEWER_PASSWORD: process.env.STAGING_VIEWER_PASSWORD,
    XRAY_CLIENT_ID: process.env.XRAY_CLIENT_ID,
    XRAY_CLIENT_SECRET: process.env.XRAY_CLIENT_SECRET,
    ATLASSIAN_URL: process.env.ATLASSIAN_URL,
    ATLASSIAN_EMAIL: process.env.ATLASSIAN_EMAIL,
    ATLASSIAN_API_TOKEN: process.env.ATLASSIAN_API_TOKEN,
  };

  console.log('\nValidating test environment variables...');
  console.log(`  TEST_ENV:  ${vars.TEST_ENV}`);
  console.log(`  TEST_ROLE: ${vars.TEST_ROLE || '(empty — legacy single-user mode)'}`);
  console.log(`  AUTO_SYNC: ${vars.AUTO_SYNC}`);
  console.log(`  TMS_PROVIDER: ${vars.TMS_PROVIDER}`);

  try {
    validateTestEnvironment(vars);
    console.log('\n✅ Test environment validated successfully');
  }
  catch (error) {
    console.error('\n❌ Validation failed:');
    console.error((error as Error).message);
    process.exit(1);
  }
}
