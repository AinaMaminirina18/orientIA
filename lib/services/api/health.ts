/**
 * Health Service Layer — ORIENT'IA
 * Calls GET /health and GET / on FastAPI backend
 */

import { fetchApi } from "./client";
import { HealthResponse, ApiStatusState } from "../../types/api/health";

export async function checkApiHealth(): Promise<ApiStatusState> {
  try {
    const health = await fetchApi<HealthResponse>("/health", { method: "GET" }, 60000);
    
    return {
      isOnline: health.status === "ok",
      statusText: health.status === "ok" ? "Service FastAPI disponible" : "Service dégradé",
      modelStatus: health.model_status || (health.model_loaded ? "Chargé" : "Non disponible"),
      ontologyStatus: health.ontology_status || (health.ontology_loaded ? "Chargé" : "Non chargée"),
      lastCheckedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      isOnline: false,
      statusText: "Service temporairement indisponible (Mode fallback local)",
      modelStatus: "Non disponible",
      ontologyStatus: "Non disponible",
      lastCheckedAt: new Date().toISOString(),
    };
  }
}
