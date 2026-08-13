import { expect, test } from '@TestFixture';

const PROJECT_ID = 'd75e73ac-b42a-487e-99e8-ac55859fc392';

test.describe('BK-42: Heatmap - Negative', () => {
  test('BK-370: should reject unsupported window (400/401)', async ({ api }) => {
    const [response] = await api.defects.rejectUnsupportedWindow(PROJECT_ID);
    expect([400, 401]).toContain(response.status());
  });
});
