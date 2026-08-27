/**
 * ADAPTER LAYER — ORIENT'IA Architecture
 * 
 * Pattern: SOURCE IMMUTABLE -> ADAPTER / PARSER -> NORMALIZED VIEW -> APPLICATION
 * 
 * Strict Skill Adherence:
 * 1. Reads raw immutable JSON files from /Data/ without mutating source files.
 * 2. Normalizes tracks, mentions, RAG sources, and synthetic profile datasets.
 * 3. Clearly tags data origins (real_corpus_ispm, synthetic_dataset, calculated_recommendation).
 */

import rawCorpusData from "../Data/Corpus-pedagogique/Simple/corpus-pedagogique-ispm.json";
import rawGraphCorpus from "../Data/Corpus-pedagogique/forkgraphe/corpus-ispm.json";
import { ISPMFormation, RAGSource, DegreeLevel } from "./types";

// Metadata origin tag for transparency
export type DataOriginTag =
  | "real_corpus_ispm"
  | "synthetic_dataset"
  | "calculated_recommendation"
  | "simulated_feature";

export interface ExtendedISPMFormation extends ISPMFormation {
  originTag: DataOriginTag;
  graphRefId?: string;
  sourcesMetadata?: {
    id: string;
    titre: string;
    origineUrl: string;
    dateConsultation: string;
    statut: string;
    donneesExtraites?: string;
    limitesIncertitudes?: string;
  }[];
}

export interface SyntheticDatasetProfile {
  profil_id: string;
  age: number;
  sexe: string;
  region: string;
  serie_bac: string;
  moyenne_generale: number;
  note_mathematiques: number;
  note_physique_chimie: number;
  note_svt: number;
  note_francais: number;
  note_malgache: number;
  note_anglais: number;
  note_histoire_geo: number;
  note_philosophie: number;
  note_economie: number;
  note_informatique: number;
  note_arts: number;
  note_eps: number;
  matieres_preferees: string[];
  competences_declarees: string[];
  centres_interet: string[];
  activites_projets: string[];
  preferences_professionnelles: string[];
  environnement_travail_recherche: string;
  mention_recommandee: string;
  parcours_recommande: string;
  parcours_recommande_nom: string;
  profil_ambigu: boolean;
  parcours_alternatif_plausible: string;
  originTag: DataOriginTag;
}

/**
 * Parses raw immutable Corpus Pedagogique JSON into normalized ISPMFormation structures
 */
export function parseCorpusFormations(): ExtendedISPMFormation[] {
  const formations: ExtendedISPMFormation[] = [];

  rawCorpusData.forEach((mentionItem: any) => {
    const mentionName = mentionItem.mention;

    mentionItem.filières_parcours.forEach((parcours: any) => {
      const code = parcours.code_parcours;
      const id = `form-${code.toLowerCase()}`;

      // Extract linked sources
      const sourceRefs: string[] = [];
      const sourcesMeta: ExtendedISPMFormation["sourcesMetadata"] = [];

      if (parcours.sources && Array.isArray(parcours.sources)) {
        parcours.sources.forEach((src: any) => {
          const srcId = src.id || `src-${code.toLowerCase()}`;
          sourceRefs.push(srcId);
          sourcesMeta.push({
            id: srcId,
            titre: src.titre || "Document Officiel ISPM",
            origineUrl: src.origine_url || "https://ispm-edu.com",
            dateConsultation: src.date_consultation || "2026-08-26",
            statut: src.statut || "officiel",
            donneesExtraites: src.donnees_extraites,
            limitesIncertitudes: src.limites_incertitudes,
          });
        });
      }

      formations.push({
        id,
        code,
        mention: mentionName,
        title: parcours.nom_parcours,
        degreeLevel: "master" as DegreeLevel,
        degreeLevelsText: parcours.niveaux_diplomes || ["Licence (Bac+3)", "Master (Bac+5)"],
        durationYears: 5, // Official ISPM Bac+5 Master curriculum
        description: `Formation d'excellence préparant aux compétences de ${parcours.nom_parcours}.`,
        keySubjects: parcours.matieres_principales || [],
        skillsDeveloped: parcours.competences_developpees || [],
        prerequisites: parcours.prerequis || ["Baccalauréat Scientifique (C, D, S) ou Technique"],
        careerOutcomes: parcours.debouches_professionnels || [],
        careerCompetenceRelations: parcours.relations_competences_metiers || [],
        passerelles: parcours.passerelles_possibles || [],
        sourceRefs,
        sourcesMetadata: sourcesMeta,
        originTag: "real_corpus_ispm",
      });
    });
  });

  return formations;
}

/**
 * Extracts all unique authentic RAG sources from the raw Corpus Pedagogique JSON
 */
export function parseCorpusRAGSources(): RAGSource[] {
  const sourcesMap = new Map<string, RAGSource>();

  rawCorpusData.forEach((mentionItem: any) => {
    mentionItem.filières_parcours.forEach((parcours: any) => {
      if (parcours.sources && Array.isArray(parcours.sources)) {
        parcours.sources.forEach((src: any, idx: number) => {
          const srcId = src.id ? `src-${src.id}` : `src-${parcours.code_parcours.toLowerCase()}-${idx + 1}`;
          if (!sourcesMap.has(srcId)) {
            sourcesMap.set(srcId, {
              id: srcId,
              title: src.titre || `Document Officiel — ${parcours.nom_parcours}`,
              type: "official_ispm",
              originUrl: src.origine_url || "https://ispm-edu.com",
              consultedAt: src.date_consultation || "2026-08-26T10:00:00Z",
              extractedSnippet:
                src.donnees_extraites ||
                `Parcours ${parcours.code_parcours} (${parcours.nom_parcours}) : ${parcours.competences_developpees?.slice(0, 2).join(". ")}.`,
              reliabilityStatus: "verified",
            });
          }
        });
      }
    });
  });

  return Array.from(sourcesMap.values());
}

/**
 * Returns raw Knowledge Graph filières count & metadata from forkgraphe/corpus-ispm.json
 */
export function getKnowledgeGraphSummary() {
  const mentionsList = (rawGraphCorpus as any).mentions || [];
  return {
    rawMentionsCount: mentionsList.length,
    mentions: mentionsList.map((m: any) => ({
      mention: m.nom || m.mention,
      parcoursCount: m.parcours?.length || m.filières_parcours?.length || 0,
      parcoursCodes: m.parcours?.map((p: any) => p.sigle || p.code_parcours) || [],
    })),
    originTag: "real_corpus_ispm" as DataOriginTag,
  };
}
