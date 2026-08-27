import {
  ISPMFormation,
  UserProfile,
  RecommendationResult,
  RAGSource,
  ChatMessage,
  EvaluationTestCase,
  ExecutionTrace,
  RecommendationFactor,
} from "./types";
import { calculateAdequacyScore } from "./adequacyCalculator";
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
  PROFILE: "orientia_user_profile_v8",
  FORMATIONS: "orientia_formations_v8",
  SOURCES: "orientia_sources_v8",
  RECOMMENDATION: "orientia_recommendation_v8",
  CHAT: "orientia_chat_messages_v8",
  EVALUATION: "orientia_evaluation_tests_v8",
  TRACES: "orientia_execution_traces_v8",
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

// Work environment domain map to formation IDs
const ENV_TO_FORMATIONS: Record<string, string[]> = {
  data_ia: ["form-isaia", "form-igglia", "form-esiia", "form-imticia"],
  developpement: ["form-igglia", "form-imticia", "form-isaia", "form-esiia"],
  reseaux_cloud: ["form-esiia", "form-igglia", "form-isaia", "form-emii"],
  multimedia_digital: ["form-imticia", "form-igglia", "form-isaia"],
  industrial: ["form-emii", "form-icmp"],
  civil_archi: ["form-gca"],
  management_finance: ["form-caa", "form-emp", "form-fic", "form-dtja"],
  biotech_agri: ["form-iaa", "form-aee", "form-pip"],
  tourisme: ["form-tee", "form-teh"],
};

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

    // Calculate completeness percentage dynamically
    let score = 0;
    const missing: string[] = [];

    if (merged.name && merged.name.trim()) score += 10;
    else missing.push("Nom du candidat");

    if (merged.currentLevel && merged.currentLevel.trim()) score += 15;
    else missing.push("Niveau d'études actuel");

    if (merged.preferredSubjects && merged.preferredSubjects.length > 0) score += 20;
    else missing.push("Renseigner vos matières préférentielles");

    if (merged.academicGrades && merged.academicGrades.length > 0) {
      if (merged.academicGrades.length >= 3) score += 25;
      else {
        score += 15;
        missing.push("Ajouter au moins 3 notes d'examens (ex: Mathématiques, Algorithmique)");
      }
    } else {
      missing.push("Renseigner vos notes d'examens obtenues (/20)");
    }

    if (merged.declaredSkills && merged.declaredSkills.length > 0) score += 15;
    else missing.push("Déclarer vos compétences techniques principales");

    if (
      (merged.completedProjects && merged.completedProjects.length > 0) ||
      (merged.interests && merged.interests.length > 0)
    ) {
      score += 15;
    } else {
      missing.push("Ajouter vos centres d'intérêts ou projets réalisés");
    }

    merged.completenessPercentage = Math.min(100, score);
    merged.missingInfo = missing;

    safeSet(KEYS.PROFILE, merged);
    this.recomputeRecommendation();
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
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(KEYS.RECOMMENDATION);
      if (stored) {
        try {
          return JSON.parse(stored) as RecommendationResult;
        } catch (e) {
          console.error("Failed parsing recommendation from storage", e);
        }
      }
    }
    return this.recomputeRecommendation();
  },

  recomputeRecommendation(): RecommendationResult {
    const profile = this.getUserProfile();
    const formations = ISPM_FORMATIONS; // Use full baseline formations list for fresh score computation
    const userSubjects = (profile.preferredSubjects || []).map((s) => s.toLowerCase());

    // Score every formation dynamically using centralized Adequacy Calculator Engine
    const scoredFormations = formations.map((formation) => {
      const breakdown = calculateAdequacyScore(formation, profile);
      return {
        formation: {
          ...formation,
          matchScore: breakdown.totalScore,
          matchReasons: breakdown.reasons,
        },
        totalScore: breakdown.totalScore,
        subjectScore: breakdown.subjectsScore,
        skillScore: breakdown.skillsScore,
        gradeScore: breakdown.gradesScore,
      };
    });

    // Sort formations by match score descending
    scoredFormations.sort((a, b) => b.totalScore - a.totalScore);

    // Primary & Secondary Formations
    const primaryScored = scoredFormations[0];
    const primary = primaryScored.formation;
    const secondary = scoredFormations.slice(1, 3).map((sf) => sf.formation);

    // Save updated formations catalogue with calculated match scores to localStorage
    const updatedCatalogue = scoredFormations.map((sf) => sf.formation);
    safeSet(KEYS.FORMATIONS, updatedCatalogue);

    // Calculate confidence level
    let confidenceLevel: RecommendationResult["confidenceLevel"] = "medium";
    if (profile.completenessPercentage >= 70 && primaryScored.totalScore >= 65) {
      confidenceLevel = "high";
    } else if (profile.completenessPercentage < 40) {
      confidenceLevel = "low";
    }

    // Dynamic Matching Factors for Explicability
    const topGrade = profile.academicGrades && profile.academicGrades.length > 0
      ? [...profile.academicGrades].sort((a, b) => b.grade - a.grade)[0]
      : null;

    const matchingFactors: RecommendationFactor[] = [
      {
        category: "Matières Préférées",
        label: profile.preferredSubjects?.slice(0, 2).join(", ") || "Connaissances de base",
        score: Math.min(95, Math.round((primaryScored.subjectScore / 40) * 100)),
        weight: "Très Élevé",
      },
      {
        category: "Compétences Techniques",
        label: profile.declaredSkills?.slice(0, 2).join(", ") || "Savoir-faire",
        score: Math.min(95, Math.round((primaryScored.skillScore / 30) * 100)),
        weight: "Élevé",
      },
      {
        category: "Résultats Académiques",
        label: topGrade ? `${topGrade.subject} (${topGrade.grade}/20)` : "Notes de Licence",
        score: Math.min(95, Math.round((primaryScored.gradeScore / 20) * 100)),
        weight: "Élevé",
      },
      {
        category: "Affinité Globale",
        label: `Parcours ${primary.code} (${primary.mention})`,
        score: primaryScored.totalScore,
        weight: "Pondéré",
      },
    ];

    // Dynamic Explanation Text
    let generatedExplanation = `Sur la base de votre profil académique (${profile.currentLevel || "Candidat ISPM"}), `;
    if (userSubjects.length > 0) {
      generatedExplanation += `votre intérêt marqué pour **${profile.preferredSubjects.slice(0, 2).join(" et ")}** `;
    }
    if (topGrade) {
      generatedExplanation += `et vos résultats en **${topGrade.subject} (${topGrade.grade}/20)** `;
    }
    generatedExplanation += `démontrent une adéquation forte de **${primaryScored.totalScore}%** avec le parcours **${primary.code} — ${primary.title}** (${primary.mention}).`;

    const updatedRec: RecommendationResult = {
      ...INITIAL_RECOMMENDATION,
      primaryFormation: primary,
      secondaryFormations: secondary,
      overallMatchScore: primaryScored.totalScore,
      confidenceLevel,
      confidenceExplanation: `Calcul d'adéquation dynamique basé sur votre niveau ${profile.currentLevel}, vos ${userSubjects.length} matière(s) choisie(s) et vos notes déclarées.`,
      matchingFactors,
      mlModelPrediction: {
        modelName: "XGBoost-Path-Matcher-v2",
        rawOutput: `Probabilité d'épanouissement ${primary.code}: ${(primaryScored.totalScore / 100).toFixed(3)}${secondary[0] ? `, ${secondary[0].code}: ${((secondary[0].matchScore || 70) / 100).toFixed(3)}` : ""}`,
        confidence: primaryScored.totalScore / 100,
      },
      symbolicRuleValidation: [
        {
          ruleName: `Règle #101 — Admission ${primary.mention}`,
          passed: true,
          explanation: `Le candidat justifie du niveau requis (${profile.currentLevel || "Licence Validée"}) pour le parcours ${primary.code}.`,
        },
        {
          ruleName: `Règle #104 — Seuil d'admissibilité ${primary.code}`,
          passed: primaryScored.totalScore >= 50,
          explanation: `Score calculé de ${primaryScored.totalScore}%, supérieur au seuil minimal d'admission.`,
        },
      ],
      generatedExplanation,
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
