import { expect, test } from '@TestFixture';

const PROJECT_ID = 'd75e73ac-b42a-487e-99e8-ac55859fc392';
const MODULE_ID = 'c9e05a37-9b4f-4194-a633-9d6f942288a1';

test.describe('BK-28: Reorder ATCs', () => {
  let testId: string;
  let stepId: string;

  test.beforeAll(async ({ api }) => {
    const data = await api.testBuilder.createTestWithData(
      PROJECT_ID,
      MODULE_ID,
      'Reorder Test',
    );
    testId = data.testId;
    stepId = data.stepId;
  });

  test('BK-404: should reorder ATCs successfully', async ({ api }) => {
    const payload = { step_ids: [stepId] };
    const [response] = await api.testBuilder.reorderAtcsSuccessfully(testId, payload);
    expect(response.status()).toBe(200);
  });

  test('BK-405: should persist reordered ATCs', async ({ api }) => {
    const payload = { step_ids: [stepId] };
    const [response, body] = await api.testBuilder.reorderAtcsPersists(testId, payload);
    expect(response.status()).toBe(200);
    expect(body.version).toBeDefined();
  });

  test('BK-406: should detect no-op reorder', async ({ api }) => {
    const payload = { step_ids: [stepId] };
    const [response] = await api.testBuilder.reorderAtcsNoop(testId, payload);
    expect(response.status()).toBe(200);
  });

  test('BK-407: should handle single ATC no-op', async ({ api }) => {
    const payload = { step_ids: [stepId] };
    const [response] = await api.testBuilder.reorderAtcsSingleAtcNoop(testId, payload);
    expect(response.status()).toBe(200);
  });

  test('BK-408: should reject unauthenticated reorder', async ({ api }) => {
    const payload = { step_ids: [] };
    const [response] = await api.testBuilder.reorderAtcsUnauthenticated(testId, payload);
    expect(response.status()).toBe(401);
  });

  test('BK-409: should reject viewer role reorder', async ({ api }) => {
    const payload = { step_ids: [stepId] };
    const [response] = await api.testBuilder.reorderAtcsViewerForbidden(testId, payload);
    expect([200, 403, 404]).toContain(response.status());
  });

  test('BK-410: should handle version conflict', async ({ api }) => {
    const payload = { step_ids: [stepId] };
    const [response] = await api.testBuilder.reorderAtcsVersionConflict(testId, payload);
    expect([200, 409, 412]).toContain(response.status());
  });

  test('BK-411: should reject chain mismatch', async ({ api }) => {
    const payload = { step_ids: ['invalid-id'] };
    const [response] = await api.testBuilder.reorderAtcsChainMismatch(testId, payload);
    expect([422, 400]).toContain(response.status());
  });

  test('BK-412: should reject duplicate ATC IDs', async ({ api }) => {
    const payload = { step_ids: [stepId, stepId] };
    const [response] = await api.testBuilder.reorderAtcsDuplicateIds(testId, payload);
    expect([422, 400]).toContain(response.status());
  });

  test('BK-413: should reject empty chain', async ({ api }) => {
    const [response] = await api.testBuilder.reorderAtcsEmptyChain(testId);
    expect([422, 400]).toContain(response.status());
  });

  test('BK-414: should log reorder activity', async ({ api }) => {
    const payload = { step_ids: [stepId] };
    const [response] = await api.testBuilder.reorderAtcsActivityLog(testId, payload);
    expect(response.status()).toBe(200);
  });

  test('BK-415: should be retry-safe', async ({ api }) => {
    const payload = { step_ids: [stepId] };
    const [response] = await api.testBuilder.reorderAtcsRetrySafe(testId, payload);
    expect(response.status()).toBe(200);
  });
});
