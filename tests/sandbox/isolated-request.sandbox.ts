/**
 * Sandbox: Isolated API request test
 * Tests if playwright.request.newContext() behaves differently in test runner
 */
import { expect, test } from '@playwright/test';
import { config } from '@variables';

test('sandbox: raw request should return 401', async ({ playwright }) => {
  const ctx = await playwright.request.newContext({
    baseURL: config.apiUrl,
    ignoreHTTPSErrors: true,
  });

  const response = await ctx.get('/v1/me', {
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
    },
  });

  console.log(`[SANDBOX] status=${response.status()}`);
  console.log(`[SANDBOX] url=${response.url()}`);
  const body = await response.text();
  console.log(`[SANDBOX] body=${body.substring(0, 200)}`);

  await ctx.dispose();
  expect(response.status()).toBe(401);
});

test('sandbox: raw request with absolute URL should return 401', async ({ playwright }) => {
  const ctx = await playwright.request.newContext({
    ignoreHTTPSErrors: true,
  });

  const response = await ctx.get('https://staging-upexbunkai.vercel.app/api/v1/me', {
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
    },
  });

  console.log(`[SANDBOX-ABS] status=${response.status()}`);
  console.log(`[SANDBOX-ABS] url=${response.url()}`);
  const body = await response.text();
  console.log(`[SANDBOX-ABS] body=${body.substring(0, 200)}`);

  await ctx.dispose();
  expect(response.status()).toBe(401);
});

test('sandbox: built-in request fixture should return 401', async ({ request }) => {
  const response = await request.get('https://staging-upexbunkai.vercel.app/api/v1/me', {
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
    },
  });

  console.log(`[SANDBOX-FIXTURE] status=${response.status()}`);
  console.log(`[SANDBOX-FIXTURE] url=${response.url()}`);
  const body = await response.text();
  console.log(`[SANDBOX-FIXTURE] body=${body.substring(0, 200)}`);

  expect(response.status()).toBe(401);
});

// NEW: Test with @TestFixture to see if the issue is there
test('sandbox: @TestFixture api should return 401', async ({ playwright }) => {
  const { config: cfg } = await import('@variables');

  const ctx = await playwright.request.newContext({
    baseURL: cfg.apiUrl,
    ignoreHTTPSErrors: true,
  });

  const response = await ctx.get('/v1/me', {
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
    },
  });

  console.log(`[SANDBOX-TESTFIXTURE] status=${response.status()}`);
  console.log(`[SANDBOX-TESTFIXTURE] url=${response.url()}`);
  const body = await response.text();
  console.log(`[SANDBOX-TESTFIXTURE] body=${body.substring(0, 200)}`);

  await ctx.dispose();
  expect(response.status()).toBe(401);
});
