/**
 * KATA Architecture - Layer 4: API Fixture
 *
 * Dependency Injection container for all API components.
 * Provides unified access to API testing capabilities.
 *
 * All API components share the same request context from TestContext,
 * ensuring consistent authentication and request configuration.
 *
 * HOW TO ADD NEW API COMPONENTS:
 * 1. Create your component in tests/components/api/YourApi.ts
 * 2. Import it here
 * 3. Add as readonly property
 * 4. Initialize in constructor passing the options
 */

import type { APIRequestContext } from '@playwright/test';
import type { TestContextOptions } from '@TestContext';

import { ApiBase } from '@api/ApiBase';
import { AuthApi } from '@api/AuthApi';
import { DefectsApi } from '@api/DefectsApi';
import { ExampleApi } from '@api/ExampleApi';
import { RunApi } from '@api/RunApi';
import { TestBuilderApi } from '@api/TestBuilderApi';

// ============================================
// API Fixture Class
// ============================================

export class ApiFixture extends ApiBase {
  /** Auth component - handles login and token management */
  readonly auth: AuthApi;

  /** Defects component - BK-40 (Defect Filing) + BK-42 (Heatmap) */
  readonly defects: DefectsApi;

  /** Example component - reference only */
  readonly example: ExampleApi;

  /** Run Execution component - BK-34 (Run Start) + BK-38 (Reporting) + BK-39 (Run Finish) */
  readonly runs: RunApi;

  /** Test Builder component - BK-28 (Reorder) + BK-32 (View) + BK-33 (Tags) */
  readonly testBuilder: TestBuilderApi;

  constructor(options: TestContextOptions & { isolatedRequest?: APIRequestContext }) {
    super(options);

    // All components receive the same options (same request context)
    this.auth = new AuthApi(options);
    this.defects = new DefectsApi(options);
    this.example = new ExampleApi(options);
    this.runs = new RunApi(options);
    this.testBuilder = new TestBuilderApi(options);
  }

  // ============================================
  // Token Propagation to Child Components
  // ============================================

  /**
   * Set authentication token for all API components.
   * This ensures all components use the same token for authenticated requests.
   */
  override setAuthToken(token: string) {
    super.setAuthToken(token);
    this.auth.setAuthToken(token);
    this.defects.setAuthToken(token);
    this.example.setAuthToken(token);
    this.runs.setAuthToken(token);
    this.testBuilder.setAuthToken(token);
  }

  /**
   * Clear authentication token from all API components.
   */
  override clearAuthToken() {
    super.clearAuthToken();
    this.auth.clearAuthToken();
    this.defects.clearAuthToken();
    this.example.clearAuthToken();
    this.runs.clearAuthToken();
    this.testBuilder.clearAuthToken();
  }
}
