import { expect, test } from '@TestFixture';

const PROJECT_ID = 'd75e73ac-b42a-487e-99e8-ac55859fc392';
const MODULE_ID = 'c9e05a37-9b4f-4194-a633-9d6f942288a1';

test.describe('BK-32: View ATCs', () => {
  let testId: string;

  test.beforeAll(async ({ api }) => {
    const data = await api.testBuilder.createTestWithData(
      PROJECT_ID,
      MODULE_ID,
      'View Test',
    );
    testId = data.testId;
  });

  test('BK-417: should view test with ATCs', async ({ api }) => {
    const [response, body] = await api.testBuilder.viewTestWithAtcs(testId);
    expect(response.status()).toBe(200);
    expect(body.atcs).toBeDefined();
    expect(body.atcs.length).toBeGreaterThan(0);
  });

  test('BK-418: should view ATCs expanded', async ({ api }) => {
    const [response, body] = await api.testBuilder.viewTestAtcsExpanded(testId);
    expect(response.status()).toBe(200);
    for (const atc of body.atcs) {
      expect(atc.id).toBeDefined();
    }
  });

  test('BK-419: should view ATCs in order', async ({ api }) => {
    const [response, body] = await api.testBuilder.viewTestAtcsInOrder(testId);
    expect(response.status()).toBe(200);
    for (let i = 0; i < body.atcs.length; i++) {
      expect(body.atcs[i].position).toBe(i + 1);
    }
  });

  test('BK-420: should view ATCs with latest content', async ({ api }) => {
    const [response, body] = await api.testBuilder.viewTestAtcsLatestContent(testId);
    expect(response.status()).toBe(200);
    for (const atc of body.atcs) {
      expect(atc.steps).toBeDefined();
    }
  });

  test('BK-421: should return 404 for missing test', async ({ api }) => {
    const [response] = await api.testBuilder.viewTestNotFound('00000000-0000-0000-0000-000000000000');
    expect(response.status()).toBe(404);
  });

  test('BK-422: should return 404 for foreign workspace', async ({ api }) => {
    const [response] = await api.testBuilder.viewTestForeignWorkspace('00000000-0000-0000-0000-000000000000');
    expect(response.status()).toBe(404);
  });

  test('BK-423: should view test read-only', async ({ api }) => {
    const [response] = await api.testBuilder.viewTestReadOnly(testId);
    expect(response.status()).toBe(200);
  });

  test('BK-424: should meet performance target', async ({ api }) => {
    const start = Date.now();
    const [response] = await api.testBuilder.viewTestPerformance(testId);
    const duration = Date.now() - start;
    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(500);
  });
});
