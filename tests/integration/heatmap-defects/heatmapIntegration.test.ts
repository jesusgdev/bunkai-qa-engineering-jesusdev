import { expect, test } from '@TestFixture';

const PROJECT_ID = 'd75e73ac-b42a-487e-99e8-ac55859fc392';

test.describe('BK-42: Heatmap - Integration', () => {
  test('BK-366: should return fresh data via live RPC (no MV)', async ({ api }) => {
    const start = Date.now();
    const [response, _body] = await api.defects.verifyFreshnessLive(PROJECT_ID);
    const duration = Date.now() - start;
    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(5000);
  });

  test('BK-367: should return generated_at timestamp', async ({ api }) => {
    const [response, _body] = await api.defects.verifyGeneratedAt(PROJECT_ID);
    expect(response.status()).toBe(200);
    expect(_body.generated_at).toBeDefined();
    const generatedAt = new Date(_body.generated_at);
    expect(generatedAt.getTime()).toBeGreaterThan(0);
  });
});
