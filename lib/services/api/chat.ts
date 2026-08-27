/**
 * Chat API Service Layer — ORIENT'IA FastAPI Integration
 * Target: POST https://fastapifororientia.onrender.com/chat
 * 
 * Exact contract from live OpenAPI schema (Render):
 * {
 *   "message": string (required),
 *   "conversation_history": [{role, content}] | null,
 *   "profil_candidat": object | null,
 *   "top_k": number | null
 * }
 */

import { fetchApi } from "./client";
import { ApiChatRequest, ApiChatResponse } from "../../types/api/chat";

export async function sendChatMessageToApi(
  payload: ApiChatRequest
): Promise<ApiChatResponse> {
  // Build body strictly matching Render OpenAPI schema
  const body: Record<string, unknown> = {
    message: String(payload.message),
    conversation_history: Array.isArray(payload.conversation_history)
      ? payload.conversation_history
      : [],
    top_k: typeof payload.top_k === "number" ? payload.top_k : 3,
  };

  // Only include profil_candidat if it has actual values (avoid sending null which may crash backend)
  if (payload.profil_candidat) {
    body.profil_candidat = {
      serie_bac: payload.profil_candidat.serie_bac || "C",
      moyenne: typeof payload.profil_candidat.moyenne === "number"
        ? payload.profil_candidat.moyenne
        : 14.0,
      matieres_fortes: Array.isArray(payload.profil_candidat.matieres_fortes)
        ? payload.profil_candidat.matieres_fortes
        : [],
    };
  }

  return await fetchApi<ApiChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
