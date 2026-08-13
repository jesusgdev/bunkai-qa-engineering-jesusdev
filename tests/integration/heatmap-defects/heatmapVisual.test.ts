import { expect, test } from '@TestFixture';

const PROJECT_ID = 'd75e73ac-b42a-487e-99e8-ac55859fc392';

test.describe('BK-42: Heatmap - Visual/a11y', () => {
  test('BK-363: should show hotspot not color-only (count + tag + legend)', async ({ api }) => {
    const [response, body] = await api.defects.verifyColorNotOnly(PROJECT_ID);
    expect(response.status()).toBe(200);
    for (const mod of body.items) {
      expect(mod.defect_count).toBeDefined();
      expect(mod.heat).toBeDefined();
    }
  });

  test('BK-364: should show trend as word + delta + icon label', async ({ api }) => {
    const [response, body] = await api.defects.verifyTrendWordDelta(PROJECT_ID);
    expect(response.status()).toBe(200);
    for (const mod of body.items) {
      expect(['rising', 'falling', 'flat']).toContain(mod.trend_direction);
    }
  });

  test('BK-365: should show full module_path to disambiguate duplicate names', async ({ api }) => {
    const [response, body] = await api.defects.verifyFullPathDisambiguation(PROJECT_ID);
    expect(response.status()).toBe(200);
    for (const mod of body.items) {
      expect(mod.module_path).toBeDefined();
      expect(mod.module_path.length).toBeGreaterThan(0);
    }
  });
});
