/**
 * Système de traçabilité ORIENT'IA (Conforme Article 15)
 */

export interface TraceEntry {
  timestamp: string;
  question: string;
  profile?: any;
  retrieved_passages?: any[];
  ml_input?: any;
  ml_output?: any;
  final_response: string;
  execution_time_ms: number;
  errors?: string[];
  safety_checks?: {
    injection_detected: boolean;
    profiling_refused: boolean;
  };
}

export const tracer = {
  log: (entry: TraceEntry) => {
    // Dans ce prototype, on logge en JSON structuré dans la console
    // Cela permet une ingestion facile par des outils de monitoring (ELK, Datadog, etc.)
    console.log("[ORIENT'IA TRACE]", JSON.stringify(entry));

    // Possibilité d'étendre ici pour enregistrer dans un fichier local ou une DB
  }
};
