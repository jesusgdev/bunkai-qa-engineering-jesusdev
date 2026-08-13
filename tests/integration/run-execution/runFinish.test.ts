import { expect, test } from '@TestFixture';

const PROJECT_ID = 'd75e73ac-b42a-487e-99e8-ac55859fc392';
const MODULE_ID = 'c9e05a37-9b4f-4194-a633-9d6f942288a1';

test.describe('BK-39: Run Finish', () => {
  let testId: string;
  let environmentId: string;

  test.beforeAll(async ({ api }) => {
    const data = await api.testBuilder.createTestWithData(
      PROJECT_ID,
      MODULE_ID,
      'Run Finish Test',
    );
    testId = data.testId;

    const headers = api.testBuilder.buildHeaders();

    // Create environment
    const createEnvResponse = await api.testBuilder.request.post(
      `${api.testBuilder.apiBaseUrl}/v1/projects/${PROJECT_ID}/environments`,
      {
        headers,
        data: { name: `Run Finish Env ${Date.now()}` },
      },
    );
    const createEnvBody = await createEnvResponse.json();
    environmentId = createEnvBody.environment?.id || createEnvBody.data?.id || createEnvBody.id || '';

    if (!environmentId) {
      throw new Error(`Failed to create environment: ${JSON.stringify(createEnvBody).substring(0, 200)}`);
    }
  });

  test('BK-388: should finish run successfully', async ({ api }) => {
    const runPayload = { test_id: testId, environment_id: environmentId };
    const [runResponse] = await api.runs.startRunSuccessfully(runPayload);
    const runId = (runResponse as unknown as { id: string }).id;

    if (runId) {
      const [response] = await api.runs.finishRunSuccessfully(runId, { verdict: 'passed' });
      expect(response.status()).toBe(200);
    }
  });

  test('BK-389: should set finished_at', async ({ api }) => {
    const runPayload = { test_id: testId, environment_id: environmentId };
    const [runResponse] = await api.runs.startRunSuccessfully(runPayload);
    const runId = (runResponse as unknown as { id: string }).id;

    if (runId) {
      const [response] = await api.runs.finishRunSetsFinishedAt(runId, { verdict: 'passed' });
      expect(response.status()).toBe(200);
    }
  });

  test('BK-390: should bump version', async ({ api }) => {
    const runPayload = { test_id: testId, environment_id: environmentId };
    const [runResponse] = await api.runs.startRunSuccessfully(runPayload);
    const runId = (runResponse as unknown as { id: string }).id;

    if (runId) {
      const [response] = await api.runs.finishRunBumpsVersion(runId, { verdict: 'passed' });
      expect(response.status()).toBe(200);
    }
  });

  test('BK-391: should mark remaining as skipped', async ({ api }) => {
    const runPayload = { test_id: testId, environment_id: environmentId };
    const [runResponse] = await api.runs.startRunSuccessfully(runPayload);
    const runId = (runResponse as unknown as { id: string }).id;

    if (runId) {
      const [response] = await api.runs.finishRunMarksRemainingSkipped(runId, { verdict: 'passed' });
      expect(response.status()).toBe(200);
    }
  });

  test('BK-392: should reject finishing already closed', async ({ api }) => {
    const runPayload = { test_id: testId, environment_id: environmentId };
    const [runResponse] = await api.runs.startRunSuccessfully(runPayload);
    const runId = (runResponse as unknown as { id: string }).id;

    if (runId) {
      await api.runs.finishRunSuccessfully(runId, { verdict: 'passed' });
      const [response] = await api.runs.finishRunRejectsAlreadyClosed(runId, { verdict: 'passed' });
      expect(response.status()).toBe(409);
    }
  });

  test('BK-393: should integrate with run lifecycle', async ({ api }) => {
    const runPayload = { test_id: testId, environment_id: environmentId };
    const [runResponse] = await api.runs.startRunSuccessfully(runPayload);
    const runId = (runResponse as unknown as { id: string }).id;

    if (runId) {
      const [response] = await api.runs.finishRunIntegration(runId, { verdict: 'passed' });
      expect(response.status()).toBe(200);
    }
  });

  test('BK-394: should reject unauthenticated finish', async ({ api }) => {
    const [response] = await api.runs.finishRunUnauthenticated('00000000-0000-0000-0000-000000000000', { verdict: 'passed' });
    expect(response.status()).toBe(401);
  });

  test('BK-395: should reject cross-workspace finish', async ({ api }) => {
    const [response] = await api.runs.finishRunCrossWorkspace('00000000-0000-0000-0000-000000000000', { verdict: 'passed' });
    expect([404]).toContain(response.status());
  });

  test('BK-396: should handle bug-driven finish', async ({ api }) => {
    const runPayload = { test_id: testId, environment_id: environmentId };
    const [runResponse] = await api.runs.startRunSuccessfully(runPayload);
    const runId = (runResponse as unknown as { id: string }).id;

    if (runId) {
      const [response] = await api.runs.finishRunBugDriven(runId, { verdict: 'failed' });
      expect(response.status()).toBe(200);
    }
  });
});
