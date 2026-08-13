/**
 * OpenAPI Type Facades — Defects/Heatmap Domain
 *
 * Derived from BK-40 (Defect Filing) and BK-42 (Heatmap) API contracts.
 * Source: staging API exploration + pre-flight-check.md
 */

// ============================================
// Defect Filing (BK-40)
// ============================================

export interface DefectPayload {
  title: string
  description?: string
  severity: 'P1' | 'P2' | 'P3' | 'P4'
  module_id: string
  project_id: string
  run_step_id?: string
  evidence?: string[]
}

export interface DefectResponse {
  bug: {
    id: string
    title: string
    severity: string
    status: string
    module_id: string
    project_id: string
    run_step_id?: string
    jira_key?: string
    evidence_urls: string[]
    created_at: string
    updated_at: string
    created_by: string
    workspace_id: string
    description?: string
    assignee_user_id?: string
    steps_to_reproduce?: string
  }
}

// ============================================
// Heatmap (BK-42)
// ============================================

export type HeatmapWindow = '7d' | '30d' | '90d';

export interface HeatmapModule {
  module_id: string
  module_name: string
  module_path: string
  defect_count: number
  heat: 'clean' | 'low' | 'elevated' | 'hotspot'
  current_week_count: number
  previous_week_count: number
  trend_direction: 'rising' | 'falling' | 'flat'
  trend_delta: number
  trend_pct: number | null
}

export interface HeatmapResponse {
  window: string
  generated_at: string
  items: HeatmapModule[]
}

// ============================================
// Error Responses
// ============================================

export interface ApiError {
  error: string
  message?: string
  details?: Record<string, string[]>
}
