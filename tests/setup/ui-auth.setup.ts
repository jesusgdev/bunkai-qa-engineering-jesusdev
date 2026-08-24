/**
 * KATA Architecture - UI Auth Setup
 *
 * Authenticates via the login page UI and intercepts the JWT token
 * using page.waitForResponse() - single authentication, no separate API call.
 *
 * This provides:
 * - Browser session (storageState) for UI tests
 * - The intercepted token is used by the browser context (cookies)
 *
 * Dependencies: global-setup
 * Dependents: e2e
 *
 * NOTE: This setup does NOT write to api-state.json (that's api-setup's job).
 * E2E tests use page.request which shares browser cookies — no separate token needed.
 */

import type { TokenResponse } from '@schemas/auth.types';

import { test as setup } from '@TestFixture';
import { attachRequestResponseToAllure } from '@utils/allure';
import { config } from '@variables';

const storageStateFile = config.auth.storageStatePath;

/**
 * UI Authentication Setup
 *
 * 1. Navigates to login page (via LoginPage.goto())
 * 2. Sets up response interception BEFORE triggering login
 * 3. Uses LoginPage.loginSuccessfully() ATC (triggers login + token fetch)
 * 4. Captures JWT token from intercepted response
 * 5. Saves storageState (cookies) for UI tests
 */
setup('UI Setup: authenticate via UI', async ({ ui, page }) => {
  console.log('[UI Setup] Starting UI authentication...');
  console.log('[UI Setup] Target: /login');

  // Navigate to login page (outside of ATC)
  await ui.login.goto();

  // Credentials for login
  const credentials = {
    email: config.testUser.email,
    password: config.testUser.password,
  };

  // Set up response interception BEFORE triggering login
  // The login UI calls /api/auth/login after successful NextAuth sign-in
  const tokenPromise = page.waitForResponse(
    resp => resp.url().includes(config.auth.tokenEndpoint)
      && resp.request().method() === 'POST'
      && resp.status() === 200,
    { timeout: 30000 },
  );

  // Use LoginPage ATC - triggers NextAuth sign-in + token fetch
  await ui.login.loginSuccessfully(credentials);
  console.log('[UI Setup] UI login successful');

  // Capture JWT token from intercepted response
  console.log('[UI Setup] Intercepting token from login response...');
  const response = await tokenPromise;
  const tokenData = (await response.json()) as TokenResponse;

  // Attach to Allure for debugging
  await attachRequestResponseToAllure({
    url: response.url(),
    method: 'POST',
    responseBody: tokenData,
    requestBody: { email: credentials.email, password: '***' },
  });

  // Verify token was obtained
  if (!tokenData?.session?.access_token) {
    throw new Error('Token response missing session.access_token');
  }

  console.log('[UI Setup] Token intercepted successfully');

  // Save storage state (cookies + localStorage) for UI tests
  await page.context().storageState({ path: storageStateFile });
  console.log(`[UI Setup] Storage state saved to ${storageStateFile}`);

  // NOTE: We do NOT write to api-state.json here.
  // That file is exclusively managed by api-setup (PAT token for integration tests).
  // E2E tests use page.request which shares browser cookies — no separate token needed.

  console.log('[UI Setup] Authentication successful');
  console.log(`[UI Setup] Current URL: ${page.url()}`);
});
