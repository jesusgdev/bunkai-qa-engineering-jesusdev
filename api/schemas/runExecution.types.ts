/**
 * OpenAPI Type Facades — Run Execution Domain
 *
 * Derived from BK-34 (Run Start), BK-38 (Run Reporting), BK-39 (Run Finish) API contracts.
 * Source: staging API exploration + story acceptance criteria
 */

// ============================================
// Run (BK-34, BK-38, BK-39)
// ============================================

export interface RunPayload {
  test_id: string
  environment_id: string
  executor_type?: 'human' | 'agent' | 'ci'
}

export interface RunStep {
  id: string
  run_atc_id: string
  atc_id: string
  step_id: string
  position: number
  state: 'pending' | 'passed' | 'failed' | 'blocked' | 'skipped'
  result?: string
  executed_at?: string
  executed_by?: string
}

export interface RunAtc {
  id: string
  run_id: string
  atc_id: string
  position: number
  verdict: 'pending' | 'passed' | 'failed' | 'blocked'
  steps: RunStep[]
}

export interface RunResponse {
  id: string
  test_id: string
  environment_id: string
  status: 'running' | 'passed' | 'failed' | 'aborted'
  executor_type: 'human' | 'agent' | 'ci'
  executor_id: string
  started_at: string
  finished_at?: string
  version: number
  run_atcs: RunAtc[]
}

export interface RunListResponse {
  items: RunResponse[]
  next_cursor?: string
  totals: {
    passed: number
    failed: number
    aborted: number
  }
}

// ============================================
// Mark Step (BK-39)
// ============================================

export interface MarkStepPayload {
  state: 'passed' | 'failed' | 'blocked'
  result?: string
}

// ============================================
// Finish/Abort (BK-39)
// ============================================

export interface FinishRunPayload {
  verdict: 'passed' | 'failed'
}

export interface AbortRunPayload {
  reason: string
}

// ============================================
// Error Responses
// ============================================

export interface ApiError {
  error: string
  message?: string
  details?: Record<string, unknown>
}
