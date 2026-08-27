/**
 * OpenAPI Chat Types — ORIENT'IA FastAPI Integration
 * OpenAPI route: POST /chat
 */

export interface ApiChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ProfilCandidatPayload {
  serie_bac: string;
  moyenne: number;
  matieres_fortes: string[];
}

export interface ApiChatRequest {
  message: string;
  conversation_history?: ApiChatMessage[];
  profil_candidat?: ProfilCandidatPayload;
  top_k?: number;
}

export interface ApiSourceMetadata {
  code_parcours?: string | null;
  nom_parcours?: string | null;
  mention?: string | null;
  fichier_source?: string | null;
  source_titre?: string | null;
  source_url?: string | null;
  statut?: string | null;
  score: number;
}

export interface ApiChatResponse {
  answer: string;
  request_id: string;
  sources?: ApiSourceMetadata[];
  disclaimer?: string;
}
