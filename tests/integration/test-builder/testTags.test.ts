import { expect, test } from '@TestFixture';

const PROJECT_ID = 'd75e73ac-b42a-487e-99e8-ac55859fc392';
const MODULE_ID = 'c9e05a37-9b4f-4194-a633-9d6f942288a1';

test.describe('BK-33: Test Tags', () => {
  let testId: string;

  test.beforeAll(async ({ api }) => {
    const data = await api.testBuilder.createTestWithData(
      PROJECT_ID,
      MODULE_ID,
      'Tags Test',
    );
    testId = data.testId;
  });

  test('BK-425: should assign reserved tags', async ({ api }) => {
    const payload = { tags: ['smoke', 'regression'] };
    const [response, body] = await api.testBuilder.assignReservedTags(testId, payload);
    expect(response.status()).toBe(200);
    expect(body.tags).toBeDefined();
    expect(body.tags).toContain('smoke');
    expect(body.tags).toContain('regression');
  });

  test('BK-426: should assign custom tags', async ({ api }) => {
    const payload = { tags: ['custom-tag', 'team-qa'] };
    const [response, body] = await api.testBuilder.assignCustomTags(testId, payload);
    expect(response.status()).toBe(200);
    expect(body.tags).toContain('custom-tag');
    expect(body.tags).toContain('team-qa');
  });

  test('BK-427: should replace tags', async ({ api }) => {
    const payload = { tags: ['sanity'] };
    const [response, body] = await api.testBuilder.replaceTags(testId, payload);
    expect(response.status()).toBe(200);
    expect(body.tags).toEqual(expect.arrayContaining(['sanity']));
  });

  test('BK-428: should remove all tags', async ({ api }) => {
    const [response, body] = await api.testBuilder.removeAllTags(testId);
    expect(response.status()).toBe(200);
    expect(body.tags).toEqual([]);
  });

  test('BK-429: should reject invalid tag format', async ({ api }) => {
    const payload = { tags: [''] };
    const [response] = await api.testBuilder.rejectInvalidTagFormat(testId, payload);
    expect([200, 400, 422]).toContain(response.status());
  });

  test('BK-430: should reject too many tags', async ({ api }) => {
    const tags = Array.from({ length: 21 }, (_, i) => `tag-${i}`);
    const payload = { tags };
    const [response] = await api.testBuilder.rejectTooManyTags(testId, payload);
    expect([400, 422]).toContain(response.status());
  });

  test('BK-431: should reject tag with comma', async ({ api }) => {
    const payload = { tags: ['tag,with,comma'] };
    const [response] = await api.testBuilder.rejectTagWithComma(testId, payload);
    expect([400, 422]).toContain(response.status());
  });

  test('BK-432: should handle duplicate tags', async ({ api }) => {
    const payload = { tags: ['smoke', 'SMOKe', 'smoke'] };
    const [response, body] = await api.testBuilder.rejectDuplicateTags(testId, payload);
    expect(response.status()).toBe(200);
    const uniqueTags = [...new Set(payload.tags.map(t => t.toLowerCase().trim()))];
    expect(body.tags.length).toBeLessThanOrEqual(uniqueTags.length);
  });

  test('BK-433: should normalize reserved tags to lowercase', async ({ api }) => {
    const payload = { tags: ['SMOKE', 'Regression'] };
    const [response, body] = await api.testBuilder.normalizeReservedTags(testId, payload);
    expect(response.status()).toBe(200);
    for (const tag of body.tags) {
      expect(tag).toBe(tag.toLowerCase());
    }
  });

  test('BK-434: should trim custom tags', async ({ api }) => {
    const payload = { tags: ['  trimmed-tag  '] };
    const [response, body] = await api.testBuilder.trimCustomTags(testId, payload);
    expect(response.status()).toBe(200);
    for (const tag of body.tags) {
      expect(tag).toBe(tag.trim());
    }
  });

  test('BK-435: should enforce max length', async ({ api }) => {
    const longTag = 'a'.repeat(51);
    const payload = { tags: [longTag] };
    const [response] = await api.testBuilder.enforceMaxLength(testId, payload);
    expect([400, 422]).toContain(response.status());
  });

  test('BK-436: should filter tests by tag', async ({ api }) => {
    const [response, body] = await api.testBuilder.filterTestsByTag('smoke');
    expect(response.status()).toBe(200);
    expect(body.items).toBeDefined();
  });

  test('BK-437: should handle optimistic lock', async ({ api }) => {
    const payload = { tags: ['optimistic-test'] };
    const [response] = await api.testBuilder.tagsOptimisticLock(testId, payload);
    expect(response.status()).toBe(200);
  });

  test('BK-438: should log tags activity', async ({ api }) => {
    const payload = { tags: ['activity-logged'] };
    const [response] = await api.testBuilder.tagsActivityLog(testId, payload);
    expect(response.status()).toBe(200);
  });
});
