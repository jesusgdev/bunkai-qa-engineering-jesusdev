import { expect, test } from '@TestFixture';

const PROJECT_ID = 'd75e73ac-b42a-487e-99e8-ac55859fc392';

test.describe('BK-42: Heatmap - Security', () => {
  test('BK-368: should reject unauthenticated request (401)', async ({ api }) => {
    const [response] = await api.defects.rejectUnauthenticated(PROJECT_ID);
    expect(response.status()).toBe(401);
  });

  test('BK-369: should reject non-member access (404)', async ({ api }) => {
    const [response] = await api.defects.rejectNonMemberAccess();
    expect([404, 403]).toContain(response.status());
  });
});
