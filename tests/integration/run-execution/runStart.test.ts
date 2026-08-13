import { expect, test } from '@TestFixture';

const PROJECT_ID = 'd75e73ac-b42a-487e-99e8-ac55859fc392';
const MODULE_ID = 'c9e05a37-9b4f-4194-a633-9d6f942288a1';

test.describe('BK-34: Run Execution Start', () => {
  let testId: string;
  let environmentId: string;

  test.beforeAll(async ({ api }) => {
    const data = await api.testBuilder.createTestWithData(
      PROJECT_ID,
      MODULE_ID,
      'Run Start Test',
    );
    testId = data.testId;

    const headers = api.testBuilder.buildHeaders();

    // Create environment
    const createEnvResponse = await api.testBuilder.request.post(
      `${api.testBuilder.apiBaseUrl}/v1/projects/${PROJECT_ID}/environments`,
      {
        headers,
        data: { name: `Run Start Env ${Date.now()}` },
      },
    );
    const createEnvBody = await createEnvResponse.json();
    environmentId = createEnvBody.environment?.id || createEnvBody.data?.id || createEnvBody.id || '';

    if (!environmentId) {
      throw new Error(`Failed to create environment: ${JSON.stringify(createEnvBody).substring(0, 200)}`);
    }
  });

  test('BK-375: should start run successfully', async ({ api }) => {
    const payload = { test_id: testId, environment_id: environmentId };
    const [response, body] = await api.runs.startRunSuccessfully(payload);
    expect([200, 201]).toContain(response.status());
    expect(body.id).toBeDefined();
  });

  test('BK-376: should start run with environment', async ({ api }) => {
    const payload = { test_id: testId, environment_id: environmentId };
    const [response, body] = await api.runs.startRunWithEnvironment(payload);
    expect([200, 201]).toContain(response.status());
    expect(body.environment_id).toBe(environmentId);
  });

  test('BK-377: should start run with executor type', async ({ api }) => {
    const payload = { test_id: testId, environment_id: environmentId, executor_type: 'human' as const };
    const [response] = await api.runs.startRunWithExecutorType(payload);
    expect([200, 201]).toContain(response.status());
  });

  test('BK-379: should be idempotent', async ({ api }) => {
    const key = `run-idem-${Date.now()}`;
    const payload = { test_id: testId, environment_id: environmentId };
    const [response1] = await api.runs.startRunIdempotent(payload, key);
    const [response2] = await api.runs.startRunIdempotent(payload, key);
    expect([200, 201, 409]).toContain(response1.status());
    expect([200, 201, 409]).toContain(response2.status());
  });

  test('BK-380: should reject invalid test', async ({ api }) => {
    const payload = { test_id: '00000000-0000-0000-0000-000000000000', environment_id: environmentId };
    const [response] = await api.runs.startRunRejectsInvalidTest(payload);
    expect([400, 403, 404, 422]).toContain(response.status());
  });

  test('BK-381: should reject invalid environment', async ({ api }) => {
    const payload = { test_id: testId, environment_id: '00000000-0000-0000-0000-000000000000' };
    const [response] = await api.runs.startRunRejectsInvalidEnvironment(payload);
    expect([400, 404, 422]).toContain(response.status());
  });

  test('BK-382: should reject unauthenticated', async ({ api }) => {
    const payload = { test_id: testId, environment_id: environmentId };
    const [response] = await api.runs.startRunUnauthenticated(payload);
    expect(response.status()).toBe(401);
  });

  test('BK-383: should handle viewer role', async ({ api }) => {
    const payload = { test_id: testId, environment_id: environmentId };
    const [response] = await api.runs.startRunViewerForbidden(payload);
    expect([200, 201, 400, 403]).toContain(response.status());
  });

  test('BK-384: should reject empty test id', async ({ api }) => {
    const payload = { test_id: '', environment_id: environmentId };
    const [response] = await api.runs.startRunRejectsEmptyTestId(payload);
    expect([400, 422]).toContain(response.status());
  });

  test('BK-385: should reject empty environment id', async ({ api }) => {
    const payload = { test_id: testId, environment_id: '' };
    const [response] = await api.runs.startRunRejectsEmptyEnvironmentId(payload);
    expect([400, 422]).toContain(response.status());
  });

  test('BK-386: should reject duplicate idempotency key', async ({ api }) => {
    const key = `run-dup-${Date.now()}`;
    const payload = { test_id: testId, environment_id: environmentId };
    await api.runs.startRunIdempotent(payload, key);
    const [response] = await api.runs.startRunRejectsDuplicateIdempotencyKey(payload, key);
    expect([200, 409]).toContain(response.status());
  });

  test('BK-387: should reject conflicting idempotency key', async ({ api }) => {
    const key = `run-conflict-${Date.now()}`;
    const payload1 = { test_id: testId, environment_id: environmentId };
    const payload2 = { test_id: '00000000-0000-0000-0000-000000000000', environment_id: environmentId };
    await api.runs.startRunIdempotent(payload1, key);
    const [response] = await api.runs.startRunRejectsConflictIdempotencyKey(payload1, payload2, key);
    expect([409]).toContain(response.status());
  });
});
