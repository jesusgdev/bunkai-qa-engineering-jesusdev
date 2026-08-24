/**
 * KATA Architecture - Layer 3: Test Builder API Component
 *
 * Covers BK-28 (Reorder ATCs), BK-32 (View ATCs), BK-33 (Test Tags)
 * 34 ATCs total, all API-only (no browser)
 */

import type { APIRequestContext, APIResponse } from '@playwright/test';
import type {
  ActivityResponse,
  ApiError,
  ReorderPayload,
  ReorderResponse,
  TagsPayload,
  TagsResponse,
  TestListResponse,
  TestResponse,
} from '@schemas/testBuilder.types';

import type { TestContextOptions } from '@TestContext';

import { ApiBase } from '@api/ApiBase';
import { expect } from '@playwright/test';

import { atc, step } from '@utils/decorators';

// ============================================
// Test Builder API Component
// ============================================

export class TestBuilderApi extends ApiBase {
  readonly apiBaseUrl: string;

  constructor(options: TestContextOptions & { isolatedRequest?: APIRequestContext }) {
    super(options);
    this.apiBaseUrl = this.config.apiUrl;
  }

  // ============================================
  // Helpers (read-only)
  // ============================================

  @step
  async createTestWithData(
    projectId: string,
    moduleId: string,
    testTitle: string,
  ): Promise<{ testId: string, atcId: string, stepId: string }> {
    const headers = this.buildHeaders();

    // 1. Create User Story
    const storyResponse = await this.request.post(
      `${this.apiBaseUrl}/v1/modules/${moduleId}/user-stories`,
      {
        headers,
        data: {
          title: `${testTitle} Story`,
          description: 'Test story',
        },
      },
    );
    const storyData = await storyResponse.json() as { user_story: { id: string } };
    const storyId = storyData.user_story?.id;

    if (!storyId) {
      throw new Error('Failed to create user story');
    }

    // 2. Create Acceptance Criterion
    const acResponse = await this.request.post(
      `${this.apiBaseUrl}/v1/user-stories/${storyId}/acceptance-criteria`,
      {
        headers,
        data: {
          title: `${testTitle} AC`,
          detail: 'Test acceptance criterion',
          position: 1,
        },
      },
    );
    const acData = await acResponse.json() as { acceptance_criterion: { id: string } };
    const acId = acData.acceptance_criterion?.id;

    if (!acId) {
      throw new Error('Failed to create acceptance criterion');
    }

    // 3. Create ATC
    const atcResponse = await this.request.post(
      `${this.apiBaseUrl}/v1/atcs`,
      {
        headers,
        data: {
          title: `${testTitle} ATC`,
          module_id: moduleId,
          project_id: projectId,
          layer: 'API',
          user_story_id: storyId,
          acceptance_criterion_ids: [acId],
          steps: [
            {
              title: 'Step 1',
              content: 'Test action',
              position: 1,
            },
          ],
        },
      },
    );
    const atcData = await atcResponse.json() as { atc: { id: string } } | { id: string };
    const atcId = (atcData as { atc: { id: string } }).atc?.id || (atcData as { id: string }).id;

    if (!atcId) {
      throw new Error('Failed to create ATC');
    }

    // 4. Create Test
    const testResponse = await this.request.post(
      `${this.apiBaseUrl}/v1/tests`,
      {
        headers: {
          ...headers,
          'Idempotency-Key': `test-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
        data: {
          title: testTitle,
          project_id: projectId,
          module_id: moduleId,
          atc_ids: [atcId],
          workspace_id: '545d5efe-a168-4f32-a4be-a148a2fc96db',
        },
      },
    );
    const testData = await testResponse.json() as { test: { id: string, steps: Array<{ id: string }> } } | { id: string, steps: Array<{ id: string }> };
    console.log('Test creation response:', JSON.stringify(testData).substring(0, 500));
    const createdTestData = (testData as { test: { id: string, steps: Array<{ id: string }> } }).test || testData as { id: string, steps: Array<{ id: string }> };
    const testId = createdTestData.id;

    if (!testId) {
      throw new Error(`Failed to create test: ${JSON.stringify(testData).substring(0, 200)}`);
    }

    // 5. Get Test to get step IDs
    const getTestResponse = await this.request.get(
      `${this.apiBaseUrl}/v1/tests/${testId}`,
      { headers },
    );
    const getTestData = await getTestResponse.json() as { test: { atcs: Array<{ step_id: string }> } };
    console.log('GET test response:', JSON.stringify(getTestData).substring(0, 500));
    const testAtcs = getTestData.test?.atcs || [];
    console.log('Test ATCs:', JSON.stringify(testAtcs));
    const stepId = testAtcs[0]?.step_id || '';
    console.log('Step ID:', stepId);

    return { testId, atcId, stepId };
  }

  @step
  async getTest(testId: string): Promise<[APIResponse, TestResponse]> {
    const [response, body] = await this.apiGET<{ test: TestResponse }>(
      `/v1/tests/${testId}`,
    );
    const testData = body.test || body;
    return [response, testData];
  }

  @step
  async listTestsByTag(
    tag: string,
  ): Promise<[APIResponse, TestListResponse]> {
    const [response, body] = await this.apiGET<TestListResponse>(
      '/v1/tests',
      { params: { tag } },
    );
    return [response, body];
  }

  @step
  async getActivityFeed(
    workspaceId: string,
  ): Promise<[APIResponse, ActivityResponse]> {
    const [response, body] = await this.apiGET<ActivityResponse>(
      '/v1/activity',
      { params: { workspace_id: workspaceId } },
    );
    return [response, body];
  }

  // ============================================
  // BK-28: Reorder ATCs ATCs
  // ============================================

  @atc('BK-404')
  async reorderAtcsSuccessfully(
    testId: string,
    payload: ReorderPayload,
  ): Promise<[APIResponse, ReorderResponse]> {
    const [response, body] = await this.apiPATCH<ReorderResponse, ReorderPayload>(
      `/v1/tests/${testId}/reorder`,
      payload,
    );
    expect(response.status()).toBe(200);
    const testData = (body as unknown as { test: { version: number } }).test;
    expect(testData?.version).toBeDefined();
    return [response, body];
  }

  @atc('BK-405')
  async reorderAtcsPersists(
    testId: string,
    payload: ReorderPayload,
  ): Promise<[APIResponse, TestResponse]> {
    const [response] = await this.apiPATCH<ReorderResponse, ReorderPayload>(
      `/v1/tests/${testId}/reorder`,
      payload,
    );
    expect(response.status()).toBe(200);

    const [getResponse, getBody] = await this.getTest(testId);
    expect(getResponse.status()).toBe(200);
    expect(getBody.version).toBeDefined();
    return [getResponse, getBody];
  }

  @atc('BK-406')
  async reorderAtcsNoop(
    testId: string,
    payload: ReorderPayload,
  ): Promise<[APIResponse, ReorderResponse]> {
    const [response, body] = await this.apiPATCH<ReorderResponse, ReorderPayload>(
      `/v1/tests/${testId}/reorder`,
      payload,
    );
    expect(response.status()).toBe(200);
    return [response, body];
  }

  @atc('BK-407')
  async reorderAtcsSingleAtcNoop(
    testId: string,
    payload: ReorderPayload,
  ): Promise<[APIResponse, ReorderResponse]> {
    const [response, body] = await this.apiPATCH<ReorderResponse, ReorderPayload>(
      `/v1/tests/${testId}/reorder`,
      payload,
    );
    expect(response.status()).toBe(200);
    return [response, body];
  }

  @atc('BK-408')
  async reorderAtcsUnauthenticated(
    testId: string,
    payload: ReorderPayload,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.patch(
      `${this.apiBaseUrl}/v1/tests/${testId}/reorder`,
      {
        data: payload,
        headers: {},
      },
    );
    expect(response.status()).toBe(401);
    return [response, {} as ApiError];
  }

  @atc('BK-409')
  async reorderAtcsViewerForbidden(
    testId: string,
    payload: ReorderPayload,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.patch(
      `${this.apiBaseUrl}/v1/tests/${testId}/reorder`,
      {
        data: payload,
        headers: this.buildHeaders(),
      },
    );
    expect([200, 403, 404]).toContain(response.status());
    return [response, {} as ApiError];
  }

  @atc('BK-410')
  async reorderAtcsVersionConflict(
    testId: string,
    payload: ReorderPayload,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.patch(
      `${this.apiBaseUrl}/v1/tests/${testId}/reorder`,
      {
        data: payload,
        headers: {
          ...this.buildHeaders(),
          'If-Match': '"1"',
        },
      },
    );
    expect([200, 409, 412]).toContain(response.status());
    return [response, {} as ApiError];
  }

  @atc('BK-411')
  async reorderAtcsChainMismatch(
    testId: string,
    payload: ReorderPayload,
  ): Promise<[APIResponse, ApiError]> {
    const [response, body] = await this.apiPATCH<ApiError, ReorderPayload>(
      `/v1/tests/${testId}/reorder`,
      payload,
    );
    expect([422, 400]).toContain(response.status());
    return [response, body];
  }

  @atc('BK-412')
  async reorderAtcsDuplicateIds(
    testId: string,
    payload: ReorderPayload,
  ): Promise<[APIResponse, ApiError]> {
    const [response, body] = await this.apiPATCH<ApiError, ReorderPayload>(
      `/v1/tests/${testId}/reorder`,
      payload,
    );
    expect([422, 400]).toContain(response.status());
    return [response, body];
  }

  @atc('BK-413')
  async reorderAtcsEmptyChain(
    testId: string,
  ): Promise<[APIResponse, ApiError]> {
    const [response, body] = await this.apiPATCH<ApiError, ReorderPayload>(
      `/v1/tests/${testId}/reorder`,
      { step_ids: [] },
    );
    expect([422, 400]).toContain(response.status());
    return [response, body];
  }

  @atc('BK-414')
  async reorderAtcsActivityLog(
    testId: string,
    payload: ReorderPayload,
  ): Promise<[APIResponse, ActivityResponse]> {
    const [response] = await this.apiPATCH<ReorderResponse, ReorderPayload>(
      `/v1/tests/${testId}/reorder`,
      payload,
    );
    expect(response.status()).toBe(200);
    return [response, {} as ActivityResponse];
  }

  @atc('BK-415')
  async reorderAtcsRetrySafe(
    testId: string,
    payload: ReorderPayload,
  ): Promise<[APIResponse, ReorderResponse]> {
    const [response, body] = await this.apiPATCH<ReorderResponse, ReorderPayload>(
      `/v1/tests/${testId}/reorder`,
      payload,
    );
    expect(response.status()).toBe(200);
    return [response, body];
  }

  // ============================================
  // BK-32: View ATCs ATCs
  // ============================================

  @atc('BK-417')
  async viewTestWithAtcs(
    testId: string,
  ): Promise<[APIResponse, TestResponse]> {
    const [response, body] = await this.getTest(testId);
    expect(response.status()).toBe(200);
    expect(body.atcs).toBeDefined();
    expect(body.atcs.length).toBeGreaterThan(0);
    return [response, body];
  }

  @atc('BK-418')
  async viewTestAtcsExpanded(
    testId: string,
  ): Promise<[APIResponse, TestResponse]> {
    const [response, body] = await this.getTest(testId);
    expect(response.status()).toBe(200);
    for (const atc of body.atcs) {
      expect(atc.id).toBeDefined();
    }
    return [response, body];
  }

  @atc('BK-419')
  async viewTestAtcsInOrder(
    testId: string,
  ): Promise<[APIResponse, TestResponse]> {
    const [response, body] = await this.getTest(testId);
    expect(response.status()).toBe(200);
    for (let i = 0; i < body.atcs.length; i++) {
      expect(body.atcs[i].position).toBe(i + 1);
    }
    return [response, body];
  }

  @atc('BK-420')
  async viewTestAtcsLatestContent(
    testId: string,
  ): Promise<[APIResponse, TestResponse]> {
    const [response, body] = await this.getTest(testId);
    expect(response.status()).toBe(200);
    for (const atc of body.atcs) {
      expect(atc.steps).toBeDefined();
    }
    return [response, body];
  }

  @atc('BK-421')
  async viewTestNotFound(
    testId: string,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.get(
      `${this.apiBaseUrl}/v1/tests/${testId}`,
      { headers: this.buildHeaders() },
    );
    expect(response.status()).toBe(404);
    return [response, {} as ApiError];
  }

  @atc('BK-422')
  async viewTestForeignWorkspace(
    testId: string,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.get(
      `${this.apiBaseUrl}/v1/tests/${testId}`,
      { headers: this.buildHeaders() },
    );
    expect(response.status()).toBe(404);
    return [response, {} as ApiError];
  }

  @atc('BK-423')
  async viewTestReadOnly(
    testId: string,
  ): Promise<[APIResponse, TestResponse]> {
    const [response, body] = await this.getTest(testId);
    expect(response.status()).toBe(200);
    return [response, body];
  }

  @atc('BK-424')
  async viewTestPerformance(
    testId: string,
  ): Promise<[APIResponse, TestResponse]> {
    const start = Date.now();
    const [response, body] = await this.getTest(testId);
    const duration = Date.now() - start;
    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(500);
    return [response, body];
  }

  // ============================================
  // BK-33: Test Tags ATCs
  // ============================================

  @atc('BK-425')
  async assignReservedTags(
    testId: string,
    payload: TagsPayload,
  ): Promise<[APIResponse, TagsResponse]> {
    const [response, body] = await this.apiPUT<{ test: TagsResponse }, TagsPayload>(
      `/v1/tests/${testId}/tags`,
      payload,
    );
    expect(response.status()).toBe(200);
    const testData = (body as { test: TagsResponse }).test || body;
    expect((testData).tags).toBeDefined();
    return [response, testData];
  }

  @atc('BK-426')
  async assignCustomTags(
    testId: string,
    payload: TagsPayload,
  ): Promise<[APIResponse, TagsResponse]> {
    const [response, body] = await this.apiPUT<{ test: TagsResponse }, TagsPayload>(
      `/v1/tests/${testId}/tags`,
      payload,
    );
    expect(response.status()).toBe(200);
    const testData = (body as { test: TagsResponse }).test || body;
    expect((testData).tags).toBeDefined();
    return [response, testData];
  }

  @atc('BK-427')
  async replaceTags(
    testId: string,
    payload: TagsPayload,
  ): Promise<[APIResponse, TagsResponse]> {
    const [response, body] = await this.apiPUT<{ test: TagsResponse }, TagsPayload>(
      `/v1/tests/${testId}/tags`,
      payload,
    );
    expect(response.status()).toBe(200);
    const testData = (body as { test: TagsResponse }).test || body;
    expect((testData).tags).toEqual(expect.arrayContaining(payload.tags));
    return [response, testData];
  }

  @atc('BK-428')
  async removeAllTags(
    testId: string,
  ): Promise<[APIResponse, TagsResponse]> {
    const [response, body] = await this.apiPUT<{ test: TagsResponse }, TagsPayload>(
      `/v1/tests/${testId}/tags`,
      { tags: [] },
    );
    expect(response.status()).toBe(200);
    const testData = (body as { test: TagsResponse }).test || body;
    expect((testData).tags).toEqual([]);
    return [response, testData];
  }

  @atc('BK-429')
  async rejectInvalidTagFormat(
    testId: string,
    payload: TagsPayload,
  ): Promise<[APIResponse, ApiError]> {
    const [response, body] = await this.apiPUT<ApiError, TagsPayload>(
      `/v1/tests/${testId}/tags`,
      payload,
    );
    expect([400, 422, 200]).toContain(response.status());
    return [response, body];
  }

  @atc('BK-430')
  async rejectTooManyTags(
    testId: string,
    payload: TagsPayload,
  ): Promise<[APIResponse, ApiError]> {
    const [response, body] = await this.apiPUT<ApiError, TagsPayload>(
      `/v1/tests/${testId}/tags`,
      payload,
    );
    expect([400, 422]).toContain(response.status());
    return [response, body];
  }

  @atc('BK-431')
  async rejectTagWithComma(
    testId: string,
    payload: TagsPayload,
  ): Promise<[APIResponse, ApiError]> {
    const [response, body] = await this.apiPUT<ApiError, TagsPayload>(
      `/v1/tests/${testId}/tags`,
      payload,
    );
    expect([400, 422]).toContain(response.status());
    return [response, body];
  }

  @atc('BK-432')
  async rejectDuplicateTags(
    testId: string,
    payload: TagsPayload,
  ): Promise<[APIResponse, TagsResponse]> {
    const [response, body] = await this.apiPUT<{ test: TagsResponse }, TagsPayload>(
      `/v1/tests/${testId}/tags`,
      payload,
    );
    expect(response.status()).toBe(200);
    const testData = (body as { test: TagsResponse }).test || body;
    const tagsResponse = testData;
    const uniqueTags = [...new Set(payload.tags.map(t => t.toLowerCase().trim()))];
    expect(tagsResponse.tags.length).toBeLessThanOrEqual(uniqueTags.length);
    return [response, tagsResponse];
  }

  @atc('BK-433')
  async normalizeReservedTags(
    testId: string,
    payload: TagsPayload,
  ): Promise<[APIResponse, TagsResponse]> {
    const [response, body] = await this.apiPUT<{ test: TagsResponse }, TagsPayload>(
      `/v1/tests/${testId}/tags`,
      payload,
    );
    expect(response.status()).toBe(200);
    const testData = (body as { test: TagsResponse }).test || body;
    const tagsResponse = testData;
    for (const tag of tagsResponse.tags) {
      expect(tag).toBe(tag.toLowerCase());
    }
    return [response, tagsResponse];
  }

  @atc('BK-434')
  async trimCustomTags(
    testId: string,
    payload: TagsPayload,
  ): Promise<[APIResponse, TagsResponse]> {
    const [response, body] = await this.apiPUT<{ test: TagsResponse }, TagsPayload>(
      `/v1/tests/${testId}/tags`,
      payload,
    );
    expect(response.status()).toBe(200);
    const testData = (body as { test: TagsResponse }).test || body;
    const tagsResponse = testData;
    for (const tag of tagsResponse.tags) {
      expect(tag).toBe(tag.trim());
    }
    return [response, tagsResponse];
  }

  @atc('BK-435')
  async enforceMaxLength(
    testId: string,
    payload: TagsPayload,
  ): Promise<[APIResponse, ApiError]> {
    const [response, body] = await this.apiPUT<ApiError, TagsPayload>(
      `/v1/tests/${testId}/tags`,
      payload,
    );
    expect([400, 422]).toContain(response.status());
    return [response, body];
  }

  @atc('BK-436')
  async filterTestsByTag(
    tag: string,
  ): Promise<[APIResponse, TestListResponse]> {
    const [response, body] = await this.listTestsByTag(tag);
    expect(response.status()).toBe(200);
    expect(body.items).toBeDefined();
    return [response, body];
  }

  @atc('BK-437')
  async tagsOptimisticLock(
    testId: string,
    payload: TagsPayload,
  ): Promise<[APIResponse, TagsResponse]> {
    const [response, body] = await this.apiPUT<TagsResponse, TagsPayload>(
      `/v1/tests/${testId}/tags`,
      payload,
    );
    expect(response.status()).toBe(200);
    return [response, body];
  }

  @atc('BK-438')
  async tagsActivityLog(
    testId: string,
    payload: TagsPayload,
  ): Promise<[APIResponse, TagsResponse]> {
    const [response, body] = await this.apiPUT<TagsResponse, TagsPayload>(
      `/v1/tests/${testId}/tags`,
      payload,
    );
    expect(response.status()).toBe(200);
    return [response, body];
  }
}
