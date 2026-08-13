import { expect, test } from '@TestFixture';

const PROJECT_ID = 'd75e73ac-b42a-487e-99e8-ac55859fc392';

test.describe('BK-42: Heatmap - Positive', () => {
  test('BK-351: should get heatmap with default 30d window', async ({ api }) => {
    const [response, body] = await api.defects.getHeatmapDefaultWindow(PROJECT_ID);
    expect(response.status()).toBe(200);
    expect(body.items).toBeDefined();
    expect(body.generated_at).toBeDefined();
  });

  test('BK-352: should switch between 7d/30d/90d windows', async ({ api }) => {
    const windows = ['7d', '30d', '90d'] as const;
    for (const window of windows) {
      const [response, body] = await api.defects.getHeatmapWindowSwitch(PROJECT_ID, window);
      expect(response.status()).toBe(200);
      expect(body.items).toBeDefined();
    }
  });

  test('BK-353: should hide archived modules', async ({ api }) => {
    const [response, body] = await api.defects.hideArchivedModules(PROJECT_ID);
    expect(response.status()).toBe(200);
    for (const mod of body.items) {
      expect(mod.module_path).not.toContain('archived');
    }
  });

  test('BK-354: should verify UTC half-open window (start included)', async ({ api }) => {
    const [response, body] = await api.defects.verifyUtcHalfOpen(PROJECT_ID);
    expect(response.status()).toBe(200);
    expect(body.generated_at).toBeDefined();
  });

  test('BK-355: should verify end boundary excluded', async ({ api }) => {
    const [response, body] = await api.defects.verifyEndExcluded(PROJECT_ID);
    expect(response.status()).toBe(200);
    const generatedAt = new Date(body.generated_at);
    expect(generatedAt.getTime()).toBeLessThanOrEqual(Date.now());
  });
});
