export type DataOriginTag =
  | "real_corpus_ispm"
  | "synthetic_dataset"
  | "calculated_recommendation"
  | "simulated_feature";

export type DegreeLevel = "licence" | "master" | "doctorat" | "Licence (Bac+3)" | "Master (Bac+5)" | string;

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
  matchReasons?: string[];
  originTag?: DataOriginTag;
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
  bacSeries?: string;
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
  originTag?: DataOriginTag;
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

export type EvaluationCategory =
  | "factual"
  | "comparison"
  | "ml_recommendation"
  | "multi_step"
  | "missing_info"
  | "ambiguity"
  | "security"
  | "bias"
  | "provenance_profiling";

export interface EvaluationTestCase {
  id: number;
  category: EvaluationCategory;
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
  retrievedDocuments: { title: string; score: number; contentSnippet?: string }[];
  toolExecutions: AgentToolCall[];
  mlInput?: string;
  mlOutput: string;
  finalResponseSnippet: string;
  totalDurationMs: number;
  safetyPassed: boolean;
  errors?: string[];
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
}
