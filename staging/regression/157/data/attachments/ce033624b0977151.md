# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: integration/heatmap-defects/defectFiling.test.ts >> BK-40: Defect Filing >> BK-346: should verify TMS-native defect without Jira sync
- Location: tests/integration/heatmap-defects/defectFiling.test.ts:93:3

# Error details

```
TypeError: Cannot read properties of undefined (reading 'id')
```

# Test source

```ts
  114 |   ): Promise<[APIResponse, ApiError]> {
  115 |     const response = await this.request.post(
  116 |       `${this.apiBaseUrl}/v1/bugs`,
  117 |       {
  118 |         headers: this.buildHeaders(),
  119 |         data: {
  120 |           title: 'Test',
  121 |           severity: 'P1',
  122 |           module_id: 'c9e05a37-9b4f-4194-a633-9d6f942288a1',
  123 |           project_id: 'd75e73ac-b42a-487e-99e8-ac55859fc392',
  124 |           run_step_id: runStepId,
  125 |         },
  126 |       },
  127 |     );
  128 |     const body = await response.json() as ApiError;
  129 |     expect(response.status()).toBe(422);
  130 |     return [response, body];
  131 |   }
  132 | 
  133 |   @atc('BK-342')
  134 |   async rejectInvalidTitleLength(
  135 |     payload: DefectPayload,
  136 |   ): Promise<[APIResponse, ApiError]> {
  137 |     const [response, body] = await this.apiPOST<ApiError, DefectPayload>(
  138 |       '/v1/bugs',
  139 |       { ...payload, title: 'ab' },
  140 |     );
  141 |     expect(response.status()).toBe(422);
  142 |     return [response, body];
  143 |   }
  144 | 
  145 |   @atc('BK-343')
  146 |   async rejectMissingModule(
  147 |     payload: DefectPayload,
  148 |   ): Promise<[APIResponse, ApiError]> {
  149 |     const nonExistentModuleId = '00000000-0000-0000-0000-000000000000';
  150 |     const response = await this.request.post(
  151 |       `${this.apiBaseUrl}/v1/bugs`,
  152 |       {
  153 |         headers: this.buildHeaders(),
  154 |         data: { ...payload, module_id: nonExistentModuleId },
  155 |       },
  156 |     );
  157 |     const body = await response.json() as ApiError;
  158 |     expect(response.status()).toBe(422);
  159 |     return [response, body];
  160 |   }
  161 | 
  162 |   @atc('BK-344')
  163 |   async rejectInvalidSeverity(
  164 |     payload: DefectPayload,
  165 |   ): Promise<[APIResponse, ApiError]> {
  166 |     const response = await this.request.post(
  167 |       `${this.apiBaseUrl}/v1/bugs`,
  168 |       {
  169 |         headers: this.buildHeaders(),
  170 |         data: { ...payload, severity: 'INVALID' },
  171 |       },
  172 |     );
  173 |     const body = await response.json() as ApiError;
  174 |     expect(response.status()).toBe(422);
  175 |     return [response, body];
  176 |   }
  177 | 
  178 |   @atc('BK-345')
  179 |   async enforceEvidenceLimit(
  180 |     payload: DefectPayload,
  181 |     evidenceCount: number,
  182 |   ): Promise<[APIResponse, DefectResponse]> {
  183 |     const evidence = Array.from({ length: evidenceCount }, (_, i) => `https://example.com/evidence/${i}`);
  184 |     const [response, body] = await this.apiPOST<DefectResponse, DefectPayload>(
  185 |       '/v1/bugs',
  186 |       { ...payload, evidence },
  187 |     );
  188 |     expect(response.status()).toBe(201);
  189 |     expect(body.bug.id).toBeDefined();
  190 |     return [response, body];
  191 |   }
  192 | 
  193 |   @atc('BK-346')
  194 |   async verifyTmsNativeDefect(
  195 |     defectId?: string,
  196 |   ): Promise<[APIResponse, DefectResponse]> {
  197 |     let targetDefectId = defectId;
  198 | 
  199 |     if (!targetDefectId) {
  200 |       const payload: DefectPayload = {
  201 |         title: 'TMS native defect',
  202 |         severity: 'P2',
  203 |         module_id: 'c9e05a37-9b4f-4194-a633-9d6f942288a1',
  204 |         project_id: 'd75e73ac-b42a-487e-99e8-ac55859fc392',
  205 |       };
  206 |       const createResponse = await this.request.post(
  207 |         `${this.apiBaseUrl}/v1/bugs`,
  208 |         {
  209 |           headers: this.buildHeaders(),
  210 |           data: payload,
  211 |         },
  212 |       );
  213 |       const createdBody = await createResponse.json() as DefectResponse;
> 214 |       targetDefectId = createdBody.bug.id;
      |                                        ^ TypeError: Cannot read properties of undefined (reading 'id')
  215 |     }
  216 | 
  217 |     const response = await this.request.get(
  218 |       `${this.apiBaseUrl}/v1/bugs/${targetDefectId}`,
  219 |       { headers: this.buildHeaders() },
  220 |     );
  221 |     expect([200, 404]).toContain(response.status());
  222 |     return [response, {} as DefectResponse];
  223 |   }
  224 | 
  225 |   // ============================================
  226 |   // BK-42: Heatmap ATCs
  227 |   // ============================================
  228 | 
  229 |   @atc('BK-351')
  230 |   async getHeatmapDefaultWindow(
  231 |     projectId: string,
  232 |   ): Promise<[APIResponse, HeatmapResponse]> {
  233 |     const [response, body] = await this.getHeatmap(projectId);
  234 |     expect(response.status()).toBe(200);
  235 |     expect(body.items).toBeDefined();
  236 |     expect(body.generated_at).toBeDefined();
  237 |     return [response, body];
  238 |   }
  239 | 
  240 |   @atc('BK-352')
  241 |   async getHeatmapWindowSwitch(
  242 |     projectId: string,
  243 |     window: HeatmapWindow,
  244 |   ): Promise<[APIResponse, HeatmapResponse]> {
  245 |     const [response, body] = await this.getHeatmap(projectId, window);
  246 |     expect(response.status()).toBe(200);
  247 |     expect(body.items).toBeDefined();
  248 |     return [response, body];
  249 |   }
  250 | 
  251 |   @atc('BK-353')
  252 |   async hideArchivedModules(
  253 |     projectId: string,
  254 |   ): Promise<[APIResponse, HeatmapResponse]> {
  255 |     const [response, body] = await this.getHeatmap(projectId);
  256 |     expect(response.status()).toBe(200);
  257 |     for (const mod of body.items) {
  258 |       expect(mod.module_path).not.toContain('archived');
  259 |     }
  260 |     return [response, body];
  261 |   }
  262 | 
  263 |   @atc('BK-354')
  264 |   async verifyUtcHalfOpen(
  265 |     projectId: string,
  266 |   ): Promise<[APIResponse, HeatmapResponse]> {
  267 |     const [response, body] = await this.getHeatmap(projectId, '7d');
  268 |     expect(response.status()).toBe(200);
  269 |     expect(body.generated_at).toBeDefined();
  270 |     return [response, body];
  271 |   }
  272 | 
  273 |   @atc('BK-355')
  274 |   async verifyEndExcluded(
  275 |     projectId: string,
  276 |   ): Promise<[APIResponse, HeatmapResponse]> {
  277 |     const [response, body] = await this.getHeatmap(projectId, '7d');
  278 |     expect(response.status()).toBe(200);
  279 |     const generatedAt = new Date(body.generated_at);
  280 |     expect(generatedAt.getTime()).toBeLessThanOrEqual(Date.now());
  281 |     return [response, body];
  282 |   }
  283 | 
  284 |   @atc('BK-356')
  285 |   async verifyRisingTrend(
  286 |     projectId: string,
  287 |   ): Promise<[APIResponse, HeatmapResponse]> {
  288 |     const [response, body] = await this.getHeatmap(projectId);
  289 |     expect(response.status()).toBe(200);
  290 |     const risingModules = body.items.filter(m => m.trend_direction === 'rising');
  291 |     if (risingModules.length > 0) {
  292 |       expect((typeof risingModules[0].trend_pct === 'number' && risingModules[0].trend_pct > 0) || risingModules[0].trend_pct === null).toBeTruthy();
  293 |     }
  294 |     return [response, body];
  295 |   }
  296 | 
  297 |   @atc('BK-357')
  298 |   async verifyFallingTrend(
  299 |     projectId: string,
  300 |   ): Promise<[APIResponse, HeatmapResponse]> {
  301 |     const [response, body] = await this.getHeatmap(projectId);
  302 |     expect(response.status()).toBe(200);
  303 |     const fallingModules = body.items.filter(m => m.trend_direction === 'falling');
  304 |     if (fallingModules.length > 0) {
  305 |       expect(fallingModules[0].trend_pct).toBeLessThan(0);
  306 |     }
  307 |     return [response, body];
  308 |   }
  309 | 
  310 |   @atc('BK-358')
  311 |   async verifyPrevZeroTrend(
  312 |     projectId: string,
  313 |   ): Promise<[APIResponse, HeatmapResponse]> {
  314 |     const [response, body] = await this.getHeatmap(projectId);
```