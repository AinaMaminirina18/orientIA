export type DegreeLevel = "licence" | "master";

export interface ISPMFormation {
  id: string;
  code: string; // e.g. "ISAIA", "IGGLIA", "ESIIA", "IMTICIA"
  mention: string; // e.g. "Informatique et Télécommunications", "Génie Industriel"
  title: string;
  degreeLevel: DegreeLevel;
  degreeLevelsText?: string[]; // e.g. ["Licence (Bac+3)", "Master (Bac+5)"]
  durationYears: number;
  description: string;
  keySubjects: string[];
  skillsDeveloped: string[];
  prerequisites: string[];
  careerOutcomes: string[];
  careerCompetenceRelations?: { competence: string; metier_cible: string }[];
  passerelles?: string[];
  sourceRefs: string[]; // IDs of RAGSource
  matchScore?: number; // 0 - 100
}

export type WorkEnvironment =
  | "data_ia"
  | "developpement"
  | "reseaux_cloud"
  | "multimedia_digital"
  | "industrial"
  | "civil_archi"
  | "management_finance"
  | "biotech_agri"
  | "tourisme";

export interface UserProfile {
  id: string;
  name: string;
  currentLevel: string; // e.g. "Bac Scientifique", "Licence Informatique"
  preferredSubjects: string[];
  academicGrades: { subject: string; grade: number }[]; // 0 - 20
  declaredSkills: string[];
  interests: string[];
  completedProjects: string[];
  preferredWorkEnvironment: WorkEnvironment;
  completenessPercentage: number; // 0 - 100
  missingInfo: string[];
  updatedAt: string;
}

export type ConfidenceLevel = "high" | "medium" | "low" | "insufficient_info";

export interface RecommendationFactor {
  category: string;
  label: string;
  score: number; // 0 - 100
  weight: string;
}

export interface RecommendationResult {
  id: string;
  primaryFormation: ISPMFormation;
  secondaryFormations: ISPMFormation[];
  overallMatchScore: number; // e.g. 87%
  confidenceLevel: ConfidenceLevel;
  confidenceExplanation: string;
  matchingFactors: RecommendationFactor[];
  mlModelPrediction: {
    modelName: string;
    rawOutput: string;
    confidence: number;
  };
  symbolicRuleValidation: {
    ruleName: string;
    passed: boolean;
    explanation: string;
  }[];
  ragSourcesUsed: RAGSource[];
  generatedExplanation: string;
  hasConflict: boolean;
  conflictDescription?: string;
  createdAt: string;
}

export interface RAGSource {
  id: string;
  title: string;
  type: "official_ispm" | "institutional" | "external";
  originUrl?: string;
  consultedAt: string;
  extractedSnippet: string;
  reliabilityStatus: "verified" | "review_needed";
  limitations?: string;
}

export type ToolStatus = "idle" | "running" | "success" | "error" | "skipped";

export interface AgentToolCall {
  id: string;
  toolName: string;
  displayName: string;
  status: ToolStatus;
  executionTime: string;
  inputSummary?: string;
  outputSummary?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  citedSources?: RAGSource[];
  toolCalls?: AgentToolCall[];
  suggestedActions?: { label: string; action: string }[];
  confidence?: ConfidenceLevel;
}

export interface EvaluationTestCase {
  id: number;
  category: "factual" | "comparison" | "ml_recommendation" | "multi_source" | "missing_info" | "ambiguity" | "prompt_injection" | "safety_guardrail";
  questionOrPrompt: string;
  expectedBehavior: string;
  status: "passed" | "failed" | "pending";
  latencyMs: number;
  notes: string;
}

export interface ExecutionTrace {
  id: string;
  timestamp: string;
  userQuery: string;
  profileSnapshot: Partial<UserProfile>;
  retrievedDocuments: { title: string; score: number }[];
  toolExecutions: AgentToolCall[];
  mlOutput: string;
  finalResponseSnippet: string;
  totalDurationMs: number;
  safetyPassed: boolean;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
}
