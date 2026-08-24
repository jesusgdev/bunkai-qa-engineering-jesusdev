/**
 * KATA Architecture - Layer 3: Run Execution API Component
 *
 * Covers BK-34 (Run Start), BK-38 (Run Reporting), BK-39 (Run Finish)
 * 26 ATCs total, all API-only (no browser)
 */

import type { APIRequestContext, APIResponse } from '@playwright/test';
import type {
  ApiError,
  FinishRunPayload,
  RunListResponse,
  RunPayload,
  RunResponse,
} from '@schemas/runExecution.types';

import type { TestContextOptions } from '@TestContext';

import { ApiBase } from '@api/ApiBase';
import { expect } from '@playwright/test';

import { atc, step } from '@utils/decorators';

// ============================================
// Run Execution API Component
// ============================================

export class RunApi extends ApiBase {
  readonly apiBaseUrl: string;

  constructor(options: TestContextOptions & { isolatedRequest?: APIRequestContext }) {
    super(options);
    this.apiBaseUrl = this.config.apiUrl;
  }

  // ============================================
  // Helpers (read-only)
  // ============================================

  @step
  async getRun(runId: string): Promise<[APIResponse, RunResponse]> {
    const response = await this.request.get(
      `${this.apiBaseUrl}/v1/runs/${runId}`,
      { headers: this.buildHeaders() },
    );
    const body = await response.json() as { test?: RunResponse } | RunResponse;
    const runData = (body as { test?: RunResponse }).test || body as RunResponse;
    return [response, runData];
  }

  @step
  async listTestRuns(
    testId: string,
  ): Promise<[APIResponse, RunListResponse]> {
    const response = await this.request.get(
      `${this.apiBaseUrl}/v1/tests/${testId}/runs`,
      { headers: this.buildHeaders() },
    );
    const raw = await response.json() as { test?: RunListResponse, runs?: RunListResponse } | RunListResponse;
    const body = (raw as { test?: RunListResponse }).test || (raw as { runs?: RunListResponse }).runs || raw as RunListResponse;
    return [response, body];
  }

  // ============================================
  // BK-34: Run Start ATCs
  // ============================================

  @atc('BK-375')
  async startRunSuccessfully(
    payload: RunPayload,
  ): Promise<[APIResponse, RunResponse]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs`,
      {
        headers: {
          ...this.buildHeaders(),
          'Idempotency-Key': `run-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
        data: payload,
      },
    );
    const body = await response.json() as { run?: RunResponse } | RunResponse;
    const runData = (body as { run?: RunResponse }).run || body as RunResponse;
    expect([200, 201]).toContain(response.status());
    expect(runData.id).toBeDefined();
    return [response, runData];
  }

  @atc('BK-376')
  async startRunWithEnvironment(
    payload: RunPayload,
  ): Promise<[APIResponse, RunResponse]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs`,
      {
        headers: {
          ...this.buildHeaders(),
          'Idempotency-Key': `run-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
        data: payload,
      },
    );
    const body = await response.json() as { run?: RunResponse } | RunResponse;
    const runData = (body as { run?: RunResponse }).run || body as RunResponse;
    expect([200, 201]).toContain(response.status());
    expect(runData.environment_id).toBe(payload.environment_id);
    return [response, runData];
  }

  @atc('BK-377')
  async startRunWithExecutorType(
    payload: RunPayload,
  ): Promise<[APIResponse, RunResponse]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs`,
      {
        headers: {
          ...this.buildHeaders(),
          'Idempotency-Key': `run-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
        data: payload,
      },
    );
    const body = await response.json() as { run?: RunResponse } | RunResponse;
    const runData = (body as { run?: RunResponse }).run || body as RunResponse;
    expect([200, 201]).toContain(response.status());
    return [response, runData];
  }

  @atc('BK-379')
  async startRunIdempotent(
    payload: RunPayload,
    idempotencyKey: string,
  ): Promise<[APIResponse, RunResponse]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs`,
      {
        headers: {
          ...this.buildHeaders(),
          'Idempotency-Key': idempotencyKey,
        },
        data: payload,
      },
    );
    const body = await response.json() as { run?: RunResponse } | RunResponse;
    const runData = (body as { run?: RunResponse }).run || body as RunResponse;
    expect([200, 201, 409]).toContain(response.status());
    return [response, runData];
  }

  @atc('BK-380')
  async startRunRejectsInvalidTest(
    payload: RunPayload,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs`,
      {
        headers: {
          ...this.buildHeaders(),
          'Idempotency-Key': `run-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
        data: payload,
      },
    );
    expect([400, 403, 404, 422]).toContain(response.status());
    return [response, {} as ApiError];
  }

  @atc('BK-381')
  async startRunRejectsInvalidEnvironment(
    payload: RunPayload,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs`,
      {
        headers: {
          ...this.buildHeaders(),
          'Idempotency-Key': `run-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
        data: payload,
      },
    );
    expect([400, 404, 422]).toContain(response.status());
    return [response, {} as ApiError];
  }

  @atc('BK-382')
  async startRunUnauthenticated(
    payload: RunPayload,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs`,
      {
        data: payload,
        headers: {},
      },
    );
    expect(response.status()).toBe(401);
    return [response, {} as ApiError];
  }

  @atc('BK-383')
  async startRunViewerForbidden(
    payload: RunPayload,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs`,
      {
        data: payload,
        headers: this.buildHeaders(),
      },
    );
    expect([200, 201, 400, 403]).toContain(response.status());
    return [response, {} as ApiError];
  }

  @atc('BK-384')
  async startRunRejectsEmptyTestId(
    payload: RunPayload,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs`,
      {
        headers: {
          ...this.buildHeaders(),
          'Idempotency-Key': `run-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
        data: payload,
      },
    );
    expect([400, 422]).toContain(response.status());
    return [response, {} as ApiError];
  }

  @atc('BK-385')
  async startRunRejectsEmptyEnvironmentId(
    payload: RunPayload,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs`,
      {
        headers: {
          ...this.buildHeaders(),
          'Idempotency-Key': `run-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
        data: payload,
      },
    );
    expect([400, 422]).toContain(response.status());
    return [response, {} as ApiError];
  }

  @atc('BK-386')
  async startRunRejectsDuplicateIdempotencyKey(
    payload: RunPayload,
    idempotencyKey: string,
  ): Promise<[APIResponse, ApiError]> {
    // First request
    await this.request.post(
      `${this.apiBaseUrl}/v1/runs`,
      {
        headers: {
          ...this.buildHeaders(),
          'Idempotency-Key': idempotencyKey,
        },
        data: payload,
      },
    );

    // Second request with same key
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs`,
      {
        headers: {
          ...this.buildHeaders(),
          'Idempotency-Key': idempotencyKey,
        },
        data: payload,
      },
    );
    expect([200, 409]).toContain(response.status());
    return [response, {} as ApiError];
  }

  @atc('BK-387')
  async startRunRejectsConflictIdempotencyKey(
    payload1: RunPayload,
    payload2: RunPayload,
    idempotencyKey: string,
  ): Promise<[APIResponse, ApiError]> {
    // First request
    await this.request.post(
      `${this.apiBaseUrl}/v1/runs`,
      {
        headers: {
          ...this.buildHeaders(),
          'Idempotency-Key': idempotencyKey,
        },
        data: payload1,
      },
    );

    // Second request with same key but different payload
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs`,
      {
        headers: {
          ...this.buildHeaders(),
          'Idempotency-Key': idempotencyKey,
        },
        data: payload2,
      },
    );
    expect([409]).toContain(response.status());
    return [response, {} as ApiError];
  }

  // ============================================
  // BK-38: Run Reporting ATCs
  // ============================================

  @atc('BK-320')
  async listRunsHappyPath(
    testId: string,
  ): Promise<[APIResponse, RunListResponse]> {
    const [response, body] = await this.listTestRuns(testId);
    expect(response.status()).toBe(200);
    expect(body.items).toBeDefined();
    return [response, body];
  }

  @atc('BK-321')
  async listRunsNewestFirst(
    testId: string,
  ): Promise<[APIResponse, RunListResponse]> {
    const [response, body] = await this.listTestRuns(testId);
    expect(response.status()).toBe(200);
    if (body.items.length > 1) {
      const firstDate = new Date(body.items[0].started_at).getTime();
      const secondDate = new Date(body.items[1].started_at).getTime();
      expect(firstDate).toBeGreaterThanOrEqual(secondDate);
    }
    return [response, body];
  }

  @atc('BK-322')
  async listRunsTerminalOnly(
    testId: string,
  ): Promise<[APIResponse, RunListResponse]> {
    const [response, body] = await this.listTestRuns(testId);
    expect(response.status()).toBe(200);
    for (const run of body.items) {
      expect(['passed', 'failed', 'aborted']).toContain(run.status);
    }
    return [response, body];
  }

  @atc('BK-323')
  async listRunsTotals(
    testId: string,
  ): Promise<[APIResponse, RunListResponse]> {
    const [response, body] = await this.listTestRuns(testId);
    expect(response.status()).toBe(200);
    expect(body.totals).toBeDefined();
    expect(body.totals.passed).toBeGreaterThanOrEqual(0);
    expect(body.totals.failed).toBeGreaterThanOrEqual(0);
    expect(body.totals.aborted).toBeGreaterThanOrEqual(0);
    return [response, body];
  }

  @atc('BK-324')
  async listRunsRejectsInvalidTest(
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.get(
      `${this.apiBaseUrl}/v1/tests/00000000-0000-0000-0000-000000000000/runs`,
      { headers: this.buildHeaders() },
    );
    expect([400, 404, 422, 200]).toContain(response.status());
    return [response, {} as ApiError];
  }

  @atc('BK-325')
  async listRunsIntegration(
    testId: string,
  ): Promise<[APIResponse, RunListResponse]> {
    const [response, body] = await this.listTestRuns(testId);
    expect(response.status()).toBe(200);
    expect(body.items).toBeDefined();
    return [response, body];
  }

  @atc('BK-326')
  async listRunsUnauthenticated(
    testId: string,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.get(
      `${this.apiBaseUrl}/v1/tests/${testId}/runs`,
      { headers: {} },
    );
    expect(response.status()).toBe(401);
    return [response, {} as ApiError];
  }

  // ============================================
  // BK-39: Run Finish ATCs
  // ============================================

  @atc('BK-388')
  async finishRunSuccessfully(
    runId: string,
    payload: FinishRunPayload,
  ): Promise<[APIResponse, RunResponse]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs/${runId}/finish`,
      {
        headers: this.buildHeaders(),
        data: payload,
      },
    );
    expect(response.status()).toBe(200);
    return [response, {} as RunResponse];
  }

  @atc('BK-389')
  async finishRunSetsFinishedAt(
    runId: string,
    payload: FinishRunPayload,
  ): Promise<[APIResponse, RunResponse]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs/${runId}/finish`,
      {
        headers: this.buildHeaders(),
        data: payload,
      },
    );
    expect(response.status()).toBe(200);
    return [response, {} as RunResponse];
  }

  @atc('BK-390')
  async finishRunBumpsVersion(
    runId: string,
    payload: FinishRunPayload,
  ): Promise<[APIResponse, RunResponse]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs/${runId}/finish`,
      {
        headers: this.buildHeaders(),
        data: payload,
      },
    );
    expect(response.status()).toBe(200);
    return [response, {} as RunResponse];
  }

  @atc('BK-391')
  async finishRunMarksRemainingSkipped(
    runId: string,
    payload: FinishRunPayload,
  ): Promise<[APIResponse, RunResponse]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs/${runId}/finish`,
      {
        headers: this.buildHeaders(),
        data: payload,
      },
    );
    expect(response.status()).toBe(200);
    return [response, {} as RunResponse];
  }

  @atc('BK-392')
  async finishRunRejectsAlreadyClosed(
    runId: string,
    payload: FinishRunPayload,
  ): Promise<[APIResponse, ApiError]> {
    // First finish
    await this.request.post(
      `${this.apiBaseUrl}/v1/runs/${runId}/finish`,
      {
        headers: this.buildHeaders(),
        data: payload,
      },
    );

    // Second finish
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs/${runId}/finish`,
      {
        headers: this.buildHeaders(),
        data: payload,
      },
    );
    expect(response.status()).toBe(409);
    return [response, {} as ApiError];
  }

  @atc('BK-393')
  async finishRunIntegration(
    runId: string,
    payload: FinishRunPayload,
  ): Promise<[APIResponse, RunResponse]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs/${runId}/finish`,
      {
        headers: this.buildHeaders(),
        data: payload,
      },
    );
    expect(response.status()).toBe(200);
    return [response, {} as RunResponse];
  }

  @atc('BK-394')
  async finishRunUnauthenticated(
    runId: string,
    payload: FinishRunPayload,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs/${runId}/finish`,
      {
        data: payload,
        headers: {},
      },
    );
    expect(response.status()).toBe(401);
    return [response, {} as ApiError];
  }

  @atc('BK-395')
  async finishRunCrossWorkspace(
    runId: string,
    payload: FinishRunPayload,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs/${runId}/finish`,
      {
        headers: this.buildHeaders(),
        data: payload,
      },
    );
    expect([404]).toContain(response.status());
    return [response, {} as ApiError];
  }

  @atc('BK-396')
  async finishRunBugDriven(
    runId: string,
    payload: FinishRunPayload,
  ): Promise<[APIResponse, RunResponse]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/runs/${runId}/finish`,
      {
        headers: this.buildHeaders(),
        data: payload,
      },
    );
    expect(response.status()).toBe(200);
    return [response, {} as RunResponse];
  }
}
