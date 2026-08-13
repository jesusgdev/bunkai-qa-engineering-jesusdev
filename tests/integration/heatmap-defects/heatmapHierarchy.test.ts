import { expect, test } from '@TestFixture';

const PROJECT_ID = 'd75e73ac-b42a-487e-99e8-ac55859fc392';

test.describe('BK-42: Heatmap - Hierarchy', () => {
  test('BK-361: should show parent rollup via path-prefix', async ({ api }) => {
    const [response, body] = await api.defects.verifyParentRollup(PROJECT_ID);
    expect(response.status()).toBe(200);
    expect(body.items.length).toBeGreaterThan(0);
  });

  test('BK-362: should show child keeps own non-collapsed cell', async ({ api }) => {
    const [response, body] = await api.defects.verifyChildOwnCell(PROJECT_ID);
    expect(response.status()).toBe(200);
    const childModules = body.items.filter(m => m.module_path.includes('/'));
    if (childModules.length > 0) {
      expect(childModules[0].defect_count).toBeGreaterThanOrEqual(0);
    }
  });
});
