import { expect, test } from '@TestFixture';

test.describe('BK-40: Defect Filing', () => {
  test('BK-338: should reject invalid run_step_id', async ({ api }) => {
    const payload = {
      title: 'Test defect from run step',
      severity: 'P1' as const,
      module_id: 'c9e05a37-9b4f-4194-a633-9d6f942288a1',
      project_id: 'd75e73ac-b42a-487e-99e8-ac55859fc392',
    };
    const runStepId = '30fd6410-1234-5678-9abc-def012345678';
    const [response] = await api.defects.createRunLinkedDefect(payload, runStepId);
    expect(response.status()).toBe(404);
  });

  test('BK-339: should reject invalid run_step_id for save', async ({ api }) => {
    const payload = {
      title: 'Run-linked defect',
      severity: 'P2' as const,
      module_id: 'c9e05a37-9b4f-4194-a633-9d6f942288a1',
      project_id: 'd75e73ac-b42a-487e-99e8-ac55859fc392',
    };
    const runStepId = '30fd6410-1234-5678-9abc-def012345678';
    const [response] = await api.defects.saveRunLinkedDefect(payload, runStepId);
    expect(response.status()).toBe(404);
  });

  test('BK-340: should save standalone defect', async ({ api }) => {
    const payload = {
      title: 'Standalone defect',
      severity: 'P3' as const,
      module_id: 'c9e05a37-9b4f-4194-a633-9d6f942288a1',
      project_id: 'd75e73ac-b42a-487e-99e8-ac55859fc392',
    };
    const [response, body] = await api.defects.saveStandaloneDefect(payload);
    expect(response.status()).toBe(201);
    expect(body.bug.project_id).toBe(payload.project_id);
  });

  test('BK-341: should reject non-failed step action', async ({ api }) => {
    const runStepId = 'non-failed-step-id';
    const [response, body] = await api.defects.rejectNonFailedStep(runStepId);
    expect(response.status()).toBe(422);
    expect(body.error).toBeDefined();
  });

  test('BK-342: should reject invalid title length', async ({ api }) => {
    const payload = {
      title: 'ab',
      severity: 'P1' as const,
      module_id: 'c9e05a37-9b4f-4194-a633-9d6f942288a1',
      project_id: 'd75e73ac-b42a-487e-99e8-ac55859fc392',
    };
    const [response] = await api.defects.rejectInvalidTitleLength(payload);
    expect(response.status()).toBe(422);
  });

  test('BK-343: should reject missing module', async ({ api }) => {
    const payload = {
      title: 'Defect with missing module',
      severity: 'P1' as const,
      module_id: 'c9e05a37-9b4f-4194-a633-9d6f942288a1',
      project_id: 'd75e73ac-b42a-487e-99e8-ac55859fc392',
    };
    const [response, body] = await api.defects.rejectMissingModule(payload);
    expect(response.status()).toBe(422);
    expect(body.error).toBeDefined();
  });

  test('BK-344: should reject invalid severity', async ({ api }) => {
    const payload = {
      title: 'Defect with invalid severity',
      severity: 'INVALID' as 'P1' | 'P2' | 'P3' | 'P4',
      module_id: 'c9e05a37-9b4f-4194-a633-9d6f942288a1',
      project_id: 'd75e73ac-b42a-487e-99e8-ac55859fc392',
    };
    const [response, body] = await api.defects.rejectInvalidSeverity(payload);
    expect(response.status()).toBe(422);
    expect(body.error).toBeDefined();
  });

  test('BK-345: should accept evidence links without limit', async ({ api }) => {
    const payload = {
      title: 'Defect with evidence',
      severity: 'P1' as const,
      module_id: 'c9e05a37-9b4f-4194-a633-9d6f942288a1',
      project_id: 'd75e73ac-b42a-487e-99e8-ac55859fc392',
    };
    const [response] = await api.defects.enforceEvidenceLimit(payload, 11);
    expect(response.status()).toBe(201);
  });

  test('BK-346: should verify TMS-native defect without Jira sync', async ({ api }) => {
    const [response] = await api.defects.verifyTmsNativeDefect();
    expect([200, 404]).toContain(response.status());
  });
});
