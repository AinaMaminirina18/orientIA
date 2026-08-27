/**
 * ADEQUACY CALCULATION ENGINE — ORIENT'IA
 * 
 * Evaluates the match score (%) between an ISPM Formation and a candidate's profile
 * using Regex pattern matching, Bac series rules, academic grades alignment,
 * preferred subjects overlap, and declared skills correlation.
 */

import { ISPMFormation, UserProfile } from "./types";

export interface AdequacyBreakdown {
  totalScore: number;
  prereqScore: number;
  gradesScore: number;
  subjectsScore: number;
  skillsScore: number;
  reasons: string[];
}

/**
 * Calculates adequacy score (%) between a formation and candidate profile using Regex matching
 */
export function calculateAdequacyScore(
  formation: ISPMFormation,
  profile: UserProfile
): AdequacyBreakdown {
  const reasons: string[] = [];

  // Extract candidate profile properties with defaults
  const bacSeries = profile.bacSeries || profile.currentLevel || "Non spécifiée";
  const grades = profile.academicGrades || [];
  const preferredSubjects = profile.preferredSubjects || [];
  const declaredSkills = profile.declaredSkills || [];
  const interests = profile.interests || [];

  // Combine text fields of formation for Regex searches
  const formationText = [
    formation.code,
    formation.title,
    formation.mention,
    formation.description,
    ...(formation.keySubjects || []),
    ...(formation.skillsDeveloped || []),
    ...(formation.careerOutcomes || []),
  ]
    .join(" ")
    .toLowerCase();

  const prereqText = (formation.prerequisites || []).join(" ").toLowerCase();

  // ─── 1. Bac Series & Prerequisites Regex Match (30%) ───────────────────────
  let prereqScore = 60; // Base score

  if (bacSeries) {
    const isScientificBac = /^(c|d|s)$/i.test(bacSeries) || /scientifique/i.test(bacSeries);
    const isTechniqueBac = /^technique$/i.test(bacSeries) || /technique/i.test(bacSeries);
    const isLiteraryBac = /^(a1|a2|l|es|ose)$/i.test(bacSeries) || /littéraire|gestion|commercial/i.test(bacSeries);

    const requiresSci = /bac.*(c|d|s|scientifique)/i.test(prereqText);
    const acceptsTech = /technique/i.test(prereqText);
    const acceptsLit = /(a1|a2|l|es|ose|gestion|commercial)/i.test(prereqText);

    if (isScientificBac) {
      if (requiresSci || /informatique|génie|biotechnologie/i.test(formation.mention)) {
        prereqScore = 95;
        reasons.push(`Série Bac (${bacSeries}) idéale pour les filières scientifiques et technologiques.`);
      } else {
        prereqScore = 85;
      }
    } else if (isTechniqueBac) {
      if (acceptsTech || /génie|électronique|mécanique|civil|informatique/i.test(formationText)) {
        prereqScore = 95;
        reasons.push(`Bac Technique parfaitement aligné avec ${formation.code}.`);
      } else {
        prereqScore = 75;
      }
    } else if (isLiteraryBac) {
      if (acceptsLit || /droit|commerce|tourisme|management|économie/i.test(formationText)) {
        prereqScore = 95;
        reasons.push(`Série Bac (${bacSeries}) très adaptée aux filières Droit, Affaires et Tourisme.`);
      } else {
        prereqScore = 55;
        reasons.push(`Formations scientifiques exigeant une mise à niveau pour la série ${bacSeries}.`);
      }
    } else {
      prereqScore = 75;
    }
  }

  // ─── 2. Academic Grades Alignment Score (30%) ──────────────────────────────
  let gradesScore = 70; // Baseline
  if (grades.length > 0) {
    let matchedGradesSum = 0;
    let matchedCount = 0;

    grades.forEach((g) => {
      const subjectName = g.subject.toLowerCase();
      // Regex check if subject is key to this formation
      const subjectRegex = new RegExp(`\\b${escapeRegExp(subjectName)}\\b`, "i");
      
      if (subjectRegex.test(formationText)) {
        matchedCount++;
        // Grade out of 20 converted to percentage
        const gradePercentage = Math.min(100, Math.max(0, (g.grade / 20) * 100));
        matchedGradesSum += gradePercentage;

        if (g.grade >= 14) {
          reasons.push(`Excellente note en ${g.subject} (${g.grade}/20) valorisée dans ${formation.code}.`);
        }
      }
    });

    if (matchedCount > 0) {
      gradesScore = Math.round(matchedGradesSum / matchedCount);
    } else {
      // Average overall grades
      const avgOverall = grades.reduce((acc, curr) => acc + curr.grade, 0) / grades.length;
      gradesScore = Math.round((avgOverall / 20) * 100);
    }
  }

  // ─── 3. Preferred Subjects Regex Overlap (20%) ─────────────────────────────
  let subjectsScore = 50;
  if (preferredSubjects.length > 0) {
    let matches = 0;
    preferredSubjects.forEach((sub) => {
      const cleanSub = sub.trim();
      if (!cleanSub) return;
      const reg = new RegExp(escapeRegExp(cleanSub), "i");
      if (reg.test(formationText)) {
        matches++;
      }
    });

    subjectsScore = Math.min(100, Math.round((matches / preferredSubjects.length) * 100 + 40));
    if (matches > 0) {
      reasons.push(`${matches} matière(s) préférée(s) directement enseignée(s) dans ce parcours.`);
    }
  }

  // ─── 4. Declared Skills & Interests Regex Overlap (20%) ───────────────────
  let skillsScore = 50;
  const userSkillsAndInterests = [...declaredSkills, ...interests];

  if (userSkillsAndInterests.length > 0) {
    let matches = 0;
    userSkillsAndInterests.forEach((skill) => {
      const cleanSkill = skill.trim();
      if (!cleanSkill) return;
      const reg = new RegExp(escapeRegExp(cleanSkill), "i");
      if (reg.test(formationText)) {
        matches++;
      }
    });

    skillsScore = Math.min(100, Math.round((matches / userSkillsAndInterests.length) * 100 + 45));
    if (matches > 0) {
      reasons.push(`Compétence(s) / intérêt(s) en forte adéquation avec les objectifs du diplôme.`);
    }
  }

  // ─── Final Weighted Score Calculation ─────────────────────────────────────
  const totalScore = Math.min(
    98,
    Math.max(
      38,
      Math.round(
        prereqScore * 0.30 +
        gradesScore * 0.30 +
        subjectsScore * 0.20 +
        skillsScore * 0.20
      )
    )
  );

  return {
    totalScore,
    prereqScore,
    gradesScore,
    subjectsScore,
    skillsScore,
    reasons: reasons.slice(0, 3), // Top 3 justification reasons
  };
}

/**
 * Escapes regex special characters safely
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Evaluates adequacy scores for an array of ISPM formations against a candidate profile
 */
export function computeFormationsWithMatch(
  formations: ISPMFormation[],
  profile: UserProfile
): (ISPMFormation & { matchScore: number; matchReasons?: string[] })[] {
  return formations.map((f) => {
    const breakdown = calculateAdequacyScore(f, profile);
    return {
      ...f,
      matchScore: breakdown.totalScore,
      matchReasons: breakdown.reasons,
    };
  });
}
