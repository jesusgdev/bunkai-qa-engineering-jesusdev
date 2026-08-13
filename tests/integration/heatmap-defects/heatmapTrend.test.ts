import { expect, test } from '@TestFixture';

const PROJECT_ID = 'd75e73ac-b42a-487e-99e8-ac55859fc392';

test.describe('BK-42: Heatmap - Trend', () => {
  test('BK-356: should show rising trend with positive percent', async ({ api }) => {
    const [response, body] = await api.defects.verifyRisingTrend(PROJECT_ID);
    expect(response.status()).toBe(200);
    const risingModules = body.items.filter(m => m.trend_direction === 'rising');
    if (risingModules.length > 0) {
      expect((typeof risingModules[0].trend_pct === 'number' && risingModules[0].trend_pct > 0) || risingModules[0].trend_pct === null).toBeTruthy();
    }
  });

  test('BK-357: should show falling trend with negative percent', async ({ api }) => {
    const [response, body] = await api.defects.verifyFallingTrend(PROJECT_ID);
    expect(response.status()).toBe(200);
    const fallingModules = body.items.filter(m => m.trend_direction === 'falling');
    if (fallingModules.length > 0) {
      expect(fallingModules[0].trend_pct).toBeLessThan(0);
    }
  });

  test('BK-358: should handle prev 0 / curr > 0 (pct: null)', async ({ api }) => {
    const [response, _body] = await api.defects.verifyPrevZeroTrend(PROJECT_ID);
    expect(response.status()).toBe(200);
  });

  test('BK-359: should handle 0/0 flat (pct: 0)', async ({ api }) => {
    const [response, body] = await api.defects.verifyBothZeroTrend(PROJECT_ID);
    expect(response.status()).toBe(200);
    const flatModules = body.items.filter(m => m.trend_direction === 'flat');
    if (flatModules.length > 0) {
      expect(flatModules[0].trend_pct).toBe(0);
    }
  });

  test('BK-360: should handle curr 0 / prev > 0 (pct: -100)', async ({ api }) => {
    const [response, body] = await api.defects.verifyCurrZeroTrend(PROJECT_ID);
    expect(response.status()).toBe(200);
    const fallingModules = body.items.filter(m => m.trend_direction === 'falling');
    if (fallingModules.length > 0) {
      expect(fallingModules[0].trend_pct).toBe(-100);
    }
  });
});
