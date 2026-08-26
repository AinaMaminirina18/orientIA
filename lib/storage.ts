import {
  ISPMFormation,
  UserProfile,
  RecommendationResult,
  RAGSource,
  ChatMessage,
  EvaluationTestCase,
  ExecutionTrace,
} from "./types";
import {
  ISPM_FORMATIONS,
  INITIAL_USER_PROFILE,
  INITIAL_RAG_SOURCES,
  INITIAL_RECOMMENDATION,
  INITIAL_CHAT_MESSAGES,
  INITIAL_EVALUATION_TESTS,
  INITIAL_EXECUTION_TRACES,
} from "./mockData";

const KEYS = {
  PROFILE: "orientia_user_profile_v3",
  FORMATIONS: "orientia_formations_v3",
  SOURCES: "orientia_sources_v3",
  RECOMMENDATION: "orientia_recommendation_v3",
  CHAT: "orientia_chat_messages_v3",
  EVALUATION: "orientia_evaluation_tests_v3",
  TRACES: "orientia_execution_traces_v3",
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[Storage] Failed key "${key}", resetting to fallback.`, error);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notify();
  } catch (error) {
    console.error(`[Storage] Failed save key "${key}".`, error);
  }
}

export const StorageRepository = {
  // User Candidate Profile
  getUserProfile(): UserProfile {
    return safeGet<UserProfile>(KEYS.PROFILE, INITIAL_USER_PROFILE);
  },

  saveUserProfile(updated: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    const merged: UserProfile = {
      ...current,
      ...updated,
      updatedAt: new Date().toISOString(),
    };

    // Calculate completeness
    let score = 0;
    if (merged.name) score += 15;
    if (merged.currentLevel) score += 15;
    if (merged.preferredSubjects && merged.preferredSubjects.length > 0) score += 25;
    if (merged.academicGrades && merged.academicGrades.length > 0) score += 25;
    if (merged.declaredSkills && merged.declaredSkills.length > 0) score += 20;

    merged.completenessPercentage = Math.min(100, score);
    safeSet(KEYS.PROFILE, merged);
    return merged;
  },

  // Formations Catalogue
  getFormations(): ISPMFormation[] {
    return safeGet<ISPMFormation[]>(KEYS.FORMATIONS, ISPM_FORMATIONS);
  },

  getFormationById(id: string): ISPMFormation | undefined {
    return this.getFormations().find((f) => f.id === id || f.code.toLowerCase() === id.toLowerCase());
  },

  // RAG Sources
  getSources(): RAGSource[] {
    return safeGet<RAGSource[]>(KEYS.SOURCES, INITIAL_RAG_SOURCES);
  },

  // Recommendation Engine
  getRecommendation(): RecommendationResult {
    return safeGet<RecommendationResult>(KEYS.RECOMMENDATION, INITIAL_RECOMMENDATION);
  },

  recomputeRecommendation(): RecommendationResult {
    const profile = this.getUserProfile();
    const formations = this.getFormations();

    const subjectsLower = profile.preferredSubjects.map((s) => s.toLowerCase()).join(" ");
    const skillsLower = profile.declaredSkills.map((s) => s.toLowerCase()).join(" ");
    const combined = subjectsLower + " " + skillsLower + " " + profile.preferredWorkEnvironment;

    // Keyword-to-formation scoring
    const scoringRules: { keywords: string[]; formationId: string; score: number }[] = [
      { keywords: ["math", "stat", "python", "data", "ia", "machine", "nlp"], formationId: "form-isaia", score: 89 },
      { keywords: ["logiciel", "gestion", "erp", "cloud", "devops", "java", "développement", "developpement"], formationId: "form-igglia", score: 82 },
      { keywords: ["electronique", "embarqué", "iot", "signal", "circuit", "fpga"], formationId: "form-esiia", score: 75 },
      { keywords: ["multimédia", "multimedia", "web", "mobile", "tic", "communication", "ux"], formationId: "form-imticia", score: 72 },
      { keywords: ["mécanique", "mecanique", "electromécanique", "automatique", "robot", "industrie"], formationId: "form-emii", score: 65 },
      { keywords: ["chimie", "minier", "pétrole", "geologie", "mine", "raffinerie"], formationId: "form-icmp", score: 60 },
      { keywords: ["btp", "béton", "beton", "bâtiment", "batiment", "architecture", "urbanisme"], formationId: "form-gca", score: 60 },
      { keywords: ["commerce", "marketing", "vente", "business", "gestion"], formationId: "form-caa", score: 58 },
      { keywords: ["économie", "economie", "projet", "management", "planification"], formationId: "form-emp", score: 56 },
      { keywords: ["finance", "comptabilité", "comptabilite", "audit", "fiscal"], formationId: "form-fic", score: 55 },
      { keywords: ["droit", "juridique", "loi", "contrat", "avocat"], formationId: "form-dtja", score: 54 },
      { keywords: ["agroalimentaire", "alimentaire", "haccp", "qualité", "qualite"], formationId: "form-iaa", score: 50 },
      { keywords: ["agriculture", "élevage", "elevage", "agronomie", "rural"], formationId: "form-aee", score: 48 },
      { keywords: ["pharmacie", "pharma", "médicament", "medicament", "biochimie"], formationId: "form-pip", score: 46 },
      { keywords: ["tourisme", "environnement", "écotourisme", "ecotourisme", "patrimoine"], formationId: "form-tee", score: 44 },
      { keywords: ["hôtellerie", "hotellerie", "restauration", "accueil", "hôtel", "hotel"], formationId: "form-teh", score: 42 },
    ];

    // Find best match
    let bestScore = 0;
    let bestId = "form-isaia";

    for (const rule of scoringRules) {
      const hits = rule.keywords.filter((kw) => combined.includes(kw)).length;
      const adjusted = hits * rule.score;
      if (adjusted > bestScore) {
        bestScore = adjusted;
        bestId = rule.formationId;
      }
    }

    const primary = formations.find((f) => f.id === bestId) ?? formations[0];
    const secondary = formations
      .filter((f) => f.id !== primary.id)
      .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
      .slice(0, 2);

    const matchScore = Math.min(95, Math.max(55, bestScore > 0 ? bestScore : 70));
    const confidenceLevel = profile.completenessPercentage >= 70 ? "high" : "medium";

    const updatedRec: RecommendationResult = {
      ...INITIAL_RECOMMENDATION,
      primaryFormation: { ...primary, matchScore },
      secondaryFormations: secondary,
      overallMatchScore: matchScore,
      confidenceLevel,
      createdAt: new Date().toISOString(),
    };

    safeSet(KEYS.RECOMMENDATION, updatedRec);
    return updatedRec;
  },

  // Assistant Chat Messages
  getChatMessages(): ChatMessage[] {
    return safeGet<ChatMessage[]>(KEYS.CHAT, INITIAL_CHAT_MESSAGES);
  },

  addChatMessage(msg: Omit<ChatMessage, "id" | "timestamp">): ChatMessage {
    const messages = this.getChatMessages();
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    messages.push(newMsg);
    safeSet(KEYS.CHAT, messages);
    return newMsg;
  },

  clearChat(): void {
    safeSet(KEYS.CHAT, INITIAL_CHAT_MESSAGES);
  },

  // Evaluation & Traces
  getEvaluationTests(): EvaluationTestCase[] {
    return safeGet<EvaluationTestCase[]>(KEYS.EVALUATION, INITIAL_EVALUATION_TESTS);
  },

  getExecutionTraces(): ExecutionTrace[] {
    return safeGet<ExecutionTrace[]>(KEYS.TRACES, INITIAL_EXECUTION_TRACES);
  },

  // Reset Storage to initial mock
  resetAllData(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(INITIAL_USER_PROFILE));
    localStorage.setItem(KEYS.FORMATIONS, JSON.stringify(ISPM_FORMATIONS));
    localStorage.setItem(KEYS.SOURCES, JSON.stringify(INITIAL_RAG_SOURCES));
    localStorage.setItem(KEYS.RECOMMENDATION, JSON.stringify(INITIAL_RECOMMENDATION));
    localStorage.setItem(KEYS.CHAT, JSON.stringify(INITIAL_CHAT_MESSAGES));
    localStorage.setItem(KEYS.EVALUATION, JSON.stringify(INITIAL_EVALUATION_TESTS));
    localStorage.setItem(KEYS.TRACES, JSON.stringify(INITIAL_EXECUTION_TRACES));
    notify();
  },
};
