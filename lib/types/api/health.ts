/**
 * API Health Status Types — ORIENT'IA FastAPI Integration
 * OpenAPI route: GET /health and GET /
 */

export interface HealthResponse {
  status: string; // e.g. "ok"
  model_status?: string; // e.g. "loaded"
  ontology_status?: string; // e.g. "not_loaded"
  message?: string;
  version?: string;
  model_loaded?: boolean;
  ontology_loaded?: boolean;
}

export interface ApiStatusState {
  isOnline: boolean;
  statusText: string;
  modelStatus: string;
  ontologyStatus: string;
  lastCheckedAt?: string;
}
