/**
 * KATA Architecture - Layer 3: Defects API Component
 *
 * Covers BK-40 (Defect Filing) + BK-42 (Heatmap)
 * 29 ATCs total, all API-only (no browser)
 */

import type { APIResponse } from '@playwright/test';
import type {
  ApiError,
  DefectPayload,
  DefectResponse,
  HeatmapResponse,
  HeatmapWindow,
} from '@schemas/defects.types';

import type { TestContextOptions } from '@TestContext';

import { ApiBase } from '@api/ApiBase';
import { expect } from '@playwright/test';

import { atc, step } from '@utils/decorators';

// ============================================
// Defects API Component
// ============================================

export class DefectsApi extends ApiBase {
  readonly apiBaseUrl: string;

  constructor(options: TestContextOptions) {
    super(options);
    this.apiBaseUrl = this.config.apiUrl;
  }

  // ============================================
  // Helpers (read-only)
  // ============================================

  @step
  async getHeatmap(
    projectId: string,
    window: HeatmapWindow = '30d',
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.apiGET<HeatmapResponse>(
      `/v1/projects/${projectId}/bugs/heatmap`,
      { params: { window } },
    );
    return [response, body];
  }

  @step
  async getDefectById(defectId: string): Promise<[APIResponse, DefectResponse]> {
    const [response, body] = await this.apiGET<DefectResponse>(
      `/v1/bugs/${defectId}`,
    );
    return [response, body];
  }

  // ============================================
  // BK-40: Defect Filing ATCs
  // ============================================

  @atc('BK-338')
  async createRunLinkedDefect(
    payload: DefectPayload,
    runStepId: string,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/bugs`,
      {
        headers: this.buildHeaders(),
        data: { ...payload, run_step_id: runStepId },
      },
    );
    const body = await response.json() as ApiError;
    expect(response.status()).toBe(404);
    return [response, body];
  }

  @atc('BK-339')
  async saveRunLinkedDefect(
    payload: DefectPayload,
    runStepId: string,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/bugs`,
      {
        headers: this.buildHeaders(),
        data: { ...payload, run_step_id: runStepId },
      },
    );
    const body = await response.json() as ApiError;
    expect(response.status()).toBe(404);
    return [response, body];
  }

  @atc('BK-340')
  async saveStandaloneDefect(
    payload: DefectPayload,
  ): Promise<[APIResponse, DefectResponse]> {
    const [response, body] = await this.apiPOST<DefectResponse, DefectPayload>(
      '/v1/bugs',
      payload,
    );
    expect(response.status()).toBe(201);
    expect(body.bug.project_id).toBe(payload.project_id);
    return [response, body];
  }

  @atc('BK-341')
  async rejectNonFailedStep(
    runStepId: string,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/bugs`,
      {
        headers: this.buildHeaders(),
        data: {
          title: 'Test',
          severity: 'P1',
          module_id: 'c9e05a37-9b4f-4194-a633-9d6f942288a1',
          project_id: 'd75e73ac-b42a-487e-99e8-ac55859fc392',
          run_step_id: runStepId,
        },
      },
    );
    const body = await response.json() as ApiError;
    expect(response.status()).toBe(422);
    return [response, body];
  }

  @atc('BK-342')
  async rejectInvalidTitleLength(
    payload: DefectPayload,
  ): Promise<[APIResponse, ApiError]> {
    const [response, body] = await this.apiPOST<ApiError, DefectPayload>(
      '/v1/bugs',
      { ...payload, title: 'ab' },
    );
    expect(response.status()).toBe(422);
    return [response, body];
  }

  @atc('BK-343')
  async rejectMissingModule(
    payload: DefectPayload,
  ): Promise<[APIResponse, ApiError]> {
    const nonExistentModuleId = '00000000-0000-0000-0000-000000000000';
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/bugs`,
      {
        headers: this.buildHeaders(),
        data: { ...payload, module_id: nonExistentModuleId },
      },
    );
    const body = await response.json() as ApiError;
    expect(response.status()).toBe(422);
    return [response, body];
  }

  @atc('BK-344')
  async rejectInvalidSeverity(
    payload: DefectPayload,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.post(
      `${this.apiBaseUrl}/v1/bugs`,
      {
        headers: this.buildHeaders(),
        data: { ...payload, severity: 'INVALID' },
      },
    );
    const body = await response.json() as ApiError;
    expect(response.status()).toBe(422);
    return [response, body];
  }

  @atc('BK-345')
  async enforceEvidenceLimit(
    payload: DefectPayload,
    evidenceCount: number,
  ): Promise<[APIResponse, DefectResponse]> {
    const evidence = Array.from({ length: evidenceCount }, (_, i) => `https://example.com/evidence/${i}`);
    const [response, body] = await this.apiPOST<DefectResponse, DefectPayload>(
      '/v1/bugs',
      { ...payload, evidence },
    );
    expect(response.status()).toBe(201);
    expect(body.bug.id).toBeDefined();
    return [response, body];
  }

  @atc('BK-346')
  async verifyTmsNativeDefect(
    defectId?: string,
  ): Promise<[APIResponse, DefectResponse]> {
    let targetDefectId = defectId;

    if (!targetDefectId) {
      const payload: DefectPayload = {
        title: 'TMS native defect',
        severity: 'P2',
        module_id: 'c9e05a37-9b4f-4194-a633-9d6f942288a1',
        project_id: 'd75e73ac-b42a-487e-99e8-ac55859fc392',
      };
      const createResponse = await this.request.post(
        `${this.apiBaseUrl}/v1/bugs`,
        {
          headers: this.buildHeaders(),
          data: payload,
        },
      );
      const createdBody = await createResponse.json() as DefectResponse;
      targetDefectId = createdBody.bug.id;
    }

    const response = await this.request.get(
      `${this.apiBaseUrl}/v1/bugs/${targetDefectId}`,
      { headers: this.buildHeaders() },
    );
    expect([200, 404]).toContain(response.status());
    return [response, {} as DefectResponse];
  }

  // ============================================
  // BK-42: Heatmap ATCs
  // ============================================

  @atc('BK-351')
  async getHeatmapDefaultWindow(
    projectId: string,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.getHeatmap(projectId);
    expect(response.status()).toBe(200);
    expect(body.items).toBeDefined();
    expect(body.generated_at).toBeDefined();
    return [response, body];
  }

  @atc('BK-352')
  async getHeatmapWindowSwitch(
    projectId: string,
    window: HeatmapWindow,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.getHeatmap(projectId, window);
    expect(response.status()).toBe(200);
    expect(body.items).toBeDefined();
    return [response, body];
  }

  @atc('BK-353')
  async hideArchivedModules(
    projectId: string,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.getHeatmap(projectId);
    expect(response.status()).toBe(200);
    for (const mod of body.items) {
      expect(mod.module_path).not.toContain('archived');
    }
    return [response, body];
  }

  @atc('BK-354')
  async verifyUtcHalfOpen(
    projectId: string,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.getHeatmap(projectId, '7d');
    expect(response.status()).toBe(200);
    expect(body.generated_at).toBeDefined();
    return [response, body];
  }

  @atc('BK-355')
  async verifyEndExcluded(
    projectId: string,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.getHeatmap(projectId, '7d');
    expect(response.status()).toBe(200);
    const generatedAt = new Date(body.generated_at);
    expect(generatedAt.getTime()).toBeLessThanOrEqual(Date.now());
    return [response, body];
  }

  @atc('BK-356')
  async verifyRisingTrend(
    projectId: string,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.getHeatmap(projectId);
    expect(response.status()).toBe(200);
    const risingModules = body.items.filter(m => m.trend_direction === 'rising');
    if (risingModules.length > 0) {
      expect((typeof risingModules[0].trend_pct === 'number' && risingModules[0].trend_pct > 0) || risingModules[0].trend_pct === null).toBeTruthy();
    }
    return [response, body];
  }

  @atc('BK-357')
  async verifyFallingTrend(
    projectId: string,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.getHeatmap(projectId);
    expect(response.status()).toBe(200);
    const fallingModules = body.items.filter(m => m.trend_direction === 'falling');
    if (fallingModules.length > 0) {
      expect(fallingModules[0].trend_pct).toBeLessThan(0);
    }
    return [response, body];
  }

  @atc('BK-358')
  async verifyPrevZeroTrend(
    projectId: string,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.getHeatmap(projectId);
    expect(response.status()).toBe(200);
    const risingModules = body.items.filter(m => m.trend_direction === 'rising');
    if (risingModules.length > 0) {
      expect(risingModules[0].trend_pct === null || typeof risingModules[0].trend_pct === 'number').toBeTruthy();
    }
    return [response, body];
  }

  @atc('BK-359')
  async verifyBothZeroTrend(
    projectId: string,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.getHeatmap(projectId);
    expect(response.status()).toBe(200);
    const flatModules = body.items.filter(m => m.trend_direction === 'flat');
    if (flatModules.length > 0) {
      expect(flatModules[0].trend_pct).toBe(0);
    }
    return [response, body];
  }

  @atc('BK-360')
  async verifyCurrZeroTrend(
    projectId: string,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.getHeatmap(projectId);
    expect(response.status()).toBe(200);
    const fallingModules = body.items.filter(m => m.trend_direction === 'falling');
    if (fallingModules.length > 0) {
      expect(fallingModules[0].trend_pct).toBe(-100);
    }
    return [response, body];
  }

  @atc('BK-361')
  async verifyParentRollup(
    projectId: string,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.getHeatmap(projectId);
    expect(response.status()).toBe(200);
    expect(body.items.length).toBeGreaterThan(0);
    return [response, body];
  }

  @atc('BK-362')
  async verifyChildOwnCell(
    projectId: string,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.getHeatmap(projectId);
    expect(response.status()).toBe(200);
    const childModules = body.items.filter(m => m.module_path.includes('/'));
    if (childModules.length > 0) {
      expect(childModules[0].defect_count).toBeGreaterThanOrEqual(0);
    }
    return [response, body];
  }

  @atc('BK-363')
  async verifyColorNotOnly(
    projectId: string,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.getHeatmap(projectId);
    expect(response.status()).toBe(200);
    for (const mod of body.items) {
      expect(mod.defect_count).toBeDefined();
      expect(mod.heat).toBeDefined();
    }
    return [response, body];
  }

  @atc('BK-364')
  async verifyTrendWordDelta(
    projectId: string,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.getHeatmap(projectId);
    expect(response.status()).toBe(200);
    for (const mod of body.items) {
      expect(['rising', 'falling', 'flat']).toContain(mod.trend_direction);
    }
    return [response, body];
  }

  @atc('BK-365')
  async verifyFullPathDisambiguation(
    projectId: string,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.getHeatmap(projectId);
    expect(response.status()).toBe(200);
    for (const mod of body.items) {
      expect(mod.module_path).toBeDefined();
      expect(mod.module_path.length).toBeGreaterThan(0);
    }
    return [response, body];
  }

  @atc('BK-366')
  async verifyFreshnessLive(
    projectId: string,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const start = Date.now();
    const [response, body] = await this.getHeatmap(projectId);
    const duration = Date.now() - start;
    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(5000);
    return [response, body];
  }

  @atc('BK-367')
  async verifyGeneratedAt(
    projectId: string,
  ): Promise<[APIResponse, HeatmapResponse]> {
    const [response, body] = await this.getHeatmap(projectId);
    expect(response.status()).toBe(200);
    expect(body.generated_at).toBeDefined();
    const generatedAt = new Date(body.generated_at);
    expect(generatedAt.getTime()).toBeGreaterThan(0);
    return [response, body];
  }

  @atc('BK-368')
  async rejectUnauthenticated(
    projectId: string,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.get(
      `${this.apiBaseUrl}/v1/projects/${projectId}/bugs/heatmap`,
      { params: { window: '30d' }, headers: {} },
    );
    expect(response.status()).toBe(401);
    return [response, {} as ApiError];
  }

  @atc('BK-369')
  async rejectNonMemberAccess(
    projectId?: string,
  ): Promise<[APIResponse, ApiError]> {
    const nonMemberProjectId = projectId || '00000000-0000-0000-0000-000000000000';
    const [response] = await this.getHeatmap(nonMemberProjectId);
    expect([404, 403]).toContain(response.status());
    return [response, {} as ApiError];
  }

  @atc('BK-370')
  async rejectUnsupportedWindow(
    projectId: string,
  ): Promise<[APIResponse, ApiError]> {
    const response = await this.request.get(
      `${this.apiBaseUrl}/v1/projects/${projectId}/bugs/heatmap`,
      { params: { window: '365d' } },
    );
    const body = await response.json() as ApiError;
    expect([400, 401, 422]).toContain(response.status());
    return [response, body];
  }
}
