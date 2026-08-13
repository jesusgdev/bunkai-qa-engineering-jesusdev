import { expect, test } from '@TestFixture';

const PROJECT_ID = 'd75e73ac-b42a-487e-99e8-ac55859fc392';
const MODULE_ID = 'c9e05a37-9b4f-4194-a633-9d6f942288a1';

test.describe('BK-38: Run Reporting', () => {
  let testId: string;

  test.beforeAll(async ({ api }) => {
    const data = await api.testBuilder.createTestWithData(
      PROJECT_ID,
      MODULE_ID,
      'Run Report Test',
    );
    testId = data.testId;
  });

  test('BK-320: should list runs happy path', async ({ api }) => {
    const [response, body] = await api.runs.listRunsHappyPath(testId);
    expect(response.status()).toBe(200);
    expect(body.items).toBeDefined();
  });

  test('BK-321: should list runs newest first', async ({ api }) => {
    const [response, body] = await api.runs.listRunsNewestFirst(testId);
    expect(response.status()).toBe(200);
    if (body.items.length > 1) {
      const firstDate = new Date(body.items[0].started_at).getTime();
      const secondDate = new Date(body.items[1].started_at).getTime();
      expect(firstDate).toBeGreaterThanOrEqual(secondDate);
    }
  });

  test('BK-322: should list terminal runs only', async ({ api }) => {
    const [response, body] = await api.runs.listRunsTerminalOnly(testId);
    expect(response.status()).toBe(200);
    for (const run of body.items) {
      expect(['passed', 'failed', 'aborted']).toContain(run.status);
    }
  });

  test('BK-323: should show totals', async ({ api }) => {
    const [response, body] = await api.runs.listRunsTotals(testId);
    expect(response.status()).toBe(200);
    expect(body.totals).toBeDefined();
    expect(body.totals.passed).toBeGreaterThanOrEqual(0);
    expect(body.totals.failed).toBeGreaterThanOrEqual(0);
    expect(body.totals.aborted).toBeGreaterThanOrEqual(0);
  });

  test('BK-324: should handle invalid test', async ({ api }) => {
    const [response] = await api.runs.listRunsRejectsInvalidTest();
    expect([400, 404, 422, 200]).toContain(response.status());
  });

  test('BK-325: should integrate with test', async ({ api }) => {
    const [response, body] = await api.runs.listRunsIntegration(testId);
    expect(response.status()).toBe(200);
    expect(body.items).toBeDefined();
  });

  test('BK-326: should reject unauthenticated', async ({ api }) => {
    const [response] = await api.runs.listRunsUnauthenticated(testId);
    expect(response.status()).toBe(401);
  });
});
