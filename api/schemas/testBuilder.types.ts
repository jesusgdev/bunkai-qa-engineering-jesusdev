/**
 * OpenAPI Type Facades — Test Builder Domain
 *
 * Derived from BK-28 (Reorder ATCs), BK-32 (View ATCs), BK-33 (Test Tags) API contracts.
 * Source: staging API exploration + story acceptance criteria
 */

// ============================================
// Test (BK-28, BK-32, BK-33)
// ============================================

export interface TestPayload {
  title: string
  description?: string
  project_id: string
  module_id?: string
  atc_ids: string[]
  workspace_id?: string
  tags?: string[]
}

export interface TestStep {
  id: string
  content: string
  expected: string | null
  position: number
  input_data: string | null
}

export interface TestAtc {
  id: string
  slug: string
  layer: string
  title: string
  status: string
  step_id: string
  position: number
  steps: TestStep[]
  assertions: unknown[]
}

export interface TestResponse {
  id: string
  title: string
  description?: string
  project_id: string
  module_id?: string
  workspace_id: string
  version: number
  tags: string[]
  atc_count: number
  created_at: string
  updated_at?: string
  created_by: string
  atcs: TestAtc[]
}

export interface TestListResponse {
  items: TestResponse[]
  next_cursor?: string
}

// ============================================
// Reorder (BK-28)
// ============================================

export interface ReorderPayload {
  step_ids: string[]
  version?: number
}

export interface ReorderResponse {
  id: string
  version: number
  updated_at: string
}

// ============================================
// Tags (BK-33)
// ============================================

export interface TagsPayload {
  tags: string[]
  version?: number
}

export interface TagsResponse {
  id: string
  tags: string[]
  version: number
  updated_at: string
}

// ============================================
// Activity Log
// ============================================

export interface ActivityEvent {
  id: string
  event_type: string
  entity_type: string
  entity_id: string
  author_id: string
  payload: Record<string, unknown>
  created_at: string
}

export interface ActivityResponse {
  items: ActivityEvent[]
  next_cursor?: string
}

// ============================================
// Error Responses
// ============================================

export interface ApiError {
  error: string
  message?: string
  details?: Record<string, unknown>
}
