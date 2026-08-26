"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  Save,
  Compass,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { useUserProfile, useRecommendation } from "@/lib/useStore";
import { useToast } from "@/lib/useToast";
import { UserProfile } from "@/lib/types";

const BAC_SERIES_OPTIONS = [
  { value: "Série C", label: "Série C (Scientifique)" },
  { value: "Série D", label: "Série D (Sciences Naturelles)" },
  { value: "Série S", label: "Série S (Scientifique)" },
  { value: "Série A1", label: "Série A1 (Littéraire)" },
  { value: "Série A2", label: "Série A2 (Littéraire & Langues)" },
  { value: "Série L", label: "Série L (Littéraire)" },
  { value: "Série ES", label: "Série ES (Économique et Sociale)" },
  { value: "Série OSE", label: "Série OSE (Organisation, Société, Économie)" },
  { value: "Série Technique", label: "Série Technique (Génie Civil, Électronique, Moteur)" },
  { value: "Série Gestion", label: "Série Gestion (Gestion des Entreprises)" },
  { value: "Série Commercial", label: "Série Commerciale (Commerce & Vente)" },
];

const ISPM_TRACK_OPTIONS = [
  { value: "IGGLIA", label: "IGGLIA — Génie Logiciel & IA" },
  { value: "ESIIA", label: "ESIIA — Électronique, Embarqué & IA" },
  { value: "IMTICIA", label: "IMTICIA — Multimédia, TIC & IA" },
  { value: "ISAIA", label: "ISAIA — Statistique Appliquée & IA" },
  { value: "EMII", label: "EMII — Électromécanique & Informatique Ind." },
  { value: "ICMP", label: "ICMP — Chimie, Mines & Pétrole" },
  { value: "GCA", label: "GCA — Génie Civil & Architecture" },
  { value: "IAA", label: "IAA — Industries Agroalimentaires" },
  { value: "AEE", label: "AEE — Agriculture & Élevage" },
  { value: "PIP", label: "PIP — Pharmacologie & Industrie Pharmaceutique" },
  { value: "CAA", label: "CAA — Commerce & Administration des Affaires" },
  { value: "EMP", label: "EMP — Économie & Management de Projet" },
  { value: "FIC", label: "FIC — Finances & Comptabilité" },
  { value: "DTJA", label: "DTJA — Droit & Juridique des Affaires" },
  { value: "TEH", label: "TEH — Tourisme, Environnement & Hôtellerie" },
  { value: "TEE", label: "TEE — Tourisme & Environnement" },
];

export default function ProfilePage() {
  const { profile, updateProfile, isMounted } = useUserProfile();
  const { recompute } = useRecommendation();
  const { toast } = useToast();

  const [name, setName] = useState(profile.name);
  const [preferredWorkEnv, setPreferredWorkEnv] = useState(profile.preferredWorkEnvironment);

  // Dynamic Level State
  const [levelCategory, setLevelCategory] = useState<"bac" | "bac3" | "master1">(() => {
    const lvl = profile.currentLevel?.toLowerCase() || "";
    if (lvl.includes("baccalauréat") || lvl.includes("bac 0") || lvl.includes("série")) return "bac";
    if (lvl.includes("master 1") || lvl.includes("m1") || lvl.includes("bac +4")) return "master1";
    return "bac3";
  });

  const [bacSerie, setBacSerie] = useState("Série C");
  const [degreeOrigin, setDegreeOrigin] = useState<"ispm" | "autre">("ispm");
  const [ispmTrack, setIspmTrack] = useState("IGGLIA");
  const [otherMention, setOtherMention] = useState("");
  const [otherInstitution, setOtherInstitution] = useState("");

  // Preferred subjects input
  const [newSubject, setNewSubject] = useState("");
  const [subjects, setSubjects] = useState<string[]>(profile.preferredSubjects);

  // Grades input
  const [gradeSubject, setGradeSubject] = useState("");
  const [gradeValue, setGradeValue] = useState("");
  const [academicGrades, setAcademicGrades] = useState(profile.academicGrades);

  // Skills
  const [newSkill, setNewSkill] = useState("");
  const [skills, setSkills] = useState<string[]>(profile.declaredSkills);

  if (!isMounted) return null;

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject("");
    }
  };

  const handleRemoveSubject = (item: string) => {
    setSubjects(subjects.filter((s) => s !== item));
  };

  const handleAddGrade = () => {
    const val = parseFloat(gradeValue);
    if (gradeSubject.trim() && !isNaN(val) && val >= 0 && val <= 20) {
      setAcademicGrades([...academicGrades, { subject: gradeSubject.trim(), grade: val }]);
      setGradeSubject("");
      setGradeValue("");
    }
  };

  const handleRemoveGrade = (idx: number) => {
    setAcademicGrades(academicGrades.filter((_, i) => i !== idx));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (sk: string) => {
    setSkills(skills.filter((s) => s !== sk));
  };

  const handleSave = () => {
    // Build computed currentLevel string
    let computedLevel = "";
    if (levelCategory === "bac") {
      computedLevel = `Baccalauréat — ${bacSerie}`;
    } else if (levelCategory === "bac3") {
      if (degreeOrigin === "ispm") {
        computedLevel = `Licence 3 (ISPM) — Parcours ${ispmTrack}`;
      } else {
        computedLevel = `Licence 3 (${otherInstitution.trim() || "Autre établissement"}) — Mention ${otherMention.trim() || "Scientifique"}`;
      }
    } else if (levelCategory === "master1") {
      if (degreeOrigin === "ispm") {
        computedLevel = `Master 1 (ISPM) — Parcours ${ispmTrack}`;
      } else {
        computedLevel = `Master 1 (${otherInstitution.trim() || "Autre établissement"}) — Mention ${otherMention.trim() || "Scientifique"}`;
      }
    }

    const updated = updateProfile({
      name,
      currentLevel: computedLevel,
      preferredSubjects: subjects,
      academicGrades,
      declaredSkills: skills,
      preferredWorkEnvironment: preferredWorkEnv as UserProfile["preferredWorkEnvironment"],
    });

    recompute();

    toast({
      type: "success",
      title: "Profil sauvegardé avec succès",
      description: `Profil mis à jour : ${computedLevel}. Complétude : ${updated.completenessPercentage}%.`,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl px-1 sm:px-0">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Parcours de Profil Candidat</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Mon Profil Académique & Intérêts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Renseignez votre profil pour permettre à ORIENT’IA de calculer votre adéquation aux filières ISPM.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Button
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            className="w-full sm:w-auto"
          >
            Enregistrer le profil
          </Button>
          <Link href="/orientation" className="w-full sm:w-auto">
            <Button variant="secondary" leftIcon={<Compass className="w-4 h-4" />} className="w-full sm:w-auto">
              Voir les matchs
            </Button>
          </Link>
        </div>
      </div>

      {/* Completeness Gauge Card */}
      <div
        className="rounded-xl text-white p-4 sm:p-6 relative overflow-hidden shadow-lg border border-slate-800 bg-cover bg-center"
        style={{
          backgroundImage: `url('/abstract-dark-blue-vector-futuristic-digital-grid-background_53876-110562.avif')`,
        }}
      >
        {/* Dark Overlay for contrast */}
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px]" aria-hidden="true" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Niveau de complétude du profil
              </span>
              <span className="text-lg font-bold text-white">
                {profile.completenessPercentage}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${profile.completenessPercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {profile.completenessPercentage >= 80
                ? "Profil suffisamment renseigné pour produire une recommandation à haute confiance."
                : "Renseignez vos notes et compétences pour augmenter la précision du modèle ML."}
            </p>
          </div>

          {profile.missingInfo && profile.missingInfo.length > 0 && (
            <div className="p-3.5 bg-slate-900/80 rounded-lg border border-slate-700 text-xs space-y-1 w-full md:max-w-xs shrink-0 backdrop-blur-sm">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                Informations conseillées :
              </span>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-[11px]">
                {profile.missingInfo.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Form Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Section 1: Informations Générales & Niveau d'Études */}
        <Card className="md:col-span-1">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm">1. Statut & Niveau d'études</CardTitle>
            <CardDescription>Déclarez votre niveau académique et vos diplômes obtenus.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
            <Input
              label="Nom / Identifiant"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* Main Level Category Select */}
            <Select
              label="Niveau d'études actuel"
              value={levelCategory}
              onChange={(e) => setLevelCategory(e.target.value as "bac" | "bac3" | "master1")}
              options={[
                { value: "bac", label: "Baccalauréat (Bac+0)" },
                { value: "bac3", label: "Bac +3 (Licence validée)" },
                { value: "master1", label: "Master 1 / Bac +4" },
              ]}
            />

            {/* CONDITIONAL FIELD: If Baccalauréat */}
            {levelCategory === "bac" && (
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-2">
                <Select
                  label="Série du Baccalauréat"
                  value={bacSerie}
                  onChange={(e) => setBacSerie(e.target.value)}
                  options={BAC_SERIES_OPTIONS}
                />
              </div>
            )}

            {/* CONDITIONAL FIELDS: If Bac +3 or Master 1 */}
            {(levelCategory === "bac3" || levelCategory === "master1") && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <Select
                  label="Établissement d'obtention"
                  value={degreeOrigin}
                  onChange={(e) => setDegreeOrigin(e.target.value as "ispm" | "autre")}
                  options={[
                    { value: "ispm", label: "Obtenu à l'ISPM" },
                    { value: "autre", label: "Autre établissement" },
                  ]}
                />

                {/* If ISPM: Track dropdown */}
                {degreeOrigin === "ispm" ? (
                  <Select
                    label="Parcours ISPM suivi"
                    value={ispmTrack}
                    onChange={(e) => setIspmTrack(e.target.value)}
                    options={ISPM_TRACK_OPTIONS}
                  />
                ) : (
                  /* If Autre établissement: Mention + Institution inputs */
                  <div className="space-y-3">
                    <Input
                      label="Mention / Domaine d'études"
                      placeholder="ex: Informatique de Gestion, Électronique"
                      value={otherMention}
                      onChange={(e) => setOtherMention(e.target.value)}
                    />
                    <Input
                      label="Nom de l'établissement"
                      placeholder="ex: Université d'Antananarivo, ESTI, ISCAM"
                      value={otherInstitution}
                      onChange={(e) => setOtherInstitution(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Target Work Environment */}
            <Select
              label="Environnement de travail & Domaine visé"
              value={preferredWorkEnv}
              onChange={(e) => setPreferredWorkEnv(e.target.value as UserProfile["preferredWorkEnvironment"])}
              options={[
                { value: "data_ia", label: "Informatique : IA, Data Science & Statistiques (ISAIA)" },
                { value: "developpement", label: "Informatique : Génie Logiciel, Cloud & Systèmes (IGGLIA)" },
                { value: "reseaux_cloud", label: "Informatique : Électronique & Systèmes Embarqués (ESIIA)" },
                { value: "multimedia_digital", label: "Informatique : Multimédia, TIC & Web (IMTICIA)" },
                { value: "industrial", label: "Génie Industriel : Électromécanique, Mines & Chimie (EMII, ICMP)" },
                { value: "civil_archi", label: "Génie Civil & Architecture (GCA)" },
                { value: "management_finance", label: "Droit, Commerce, Finance & Management (CAA, EMP, FIC, DTJA)" },
                { value: "biotech_agri", label: "Biotechnologie, Agronomie & Pharmacie (IAA, AEE, PIP)" },
                { value: "tourisme", label: "Tourisme, Hôtellerie & Environnement (TEE, TEH)" },
              ]}
            />
          </CardContent>
        </Card>

        {/* Section 2: Matières Préférées */}
        <Card className="md:col-span-1">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm">2. Matières préférentielles</CardTitle>
            <CardDescription>Matières scientifiques et techniques qui vous passionnent.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="ex: Algèbre, Électronique, Droit"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
              <Button size="sm" onClick={handleAddSubject} leftIcon={<Plus className="w-4 h-4" />} className="shrink-0">
                Ajouter
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
              {subjects.map((sub) => (
                <span
                  key={sub}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold"
                >
                  {sub}
                  <button
                    onClick={() => handleRemoveSubject(sub)}
                    className="hover:text-rose-600 p-0.5 rounded ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Notes & Résultats Académiques */}
        <Card className="md:col-span-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm">3. Résultats & Notes obtenues (/20)</CardTitle>
            <CardDescription>
              Ces notes sont utilisées par le modèle ML de prédiction et la vérification des règles d'admissibilité.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder="Discipline / Matière (ex: Mathématiques)"
                value={gradeSubject}
                onChange={(e) => setGradeSubject(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Note sur 20 (ex: 16.5)"
                value={gradeValue}
                onChange={(e) => setGradeValue(e.target.value)}
              />
              <Button size="sm" onClick={handleAddGrade} leftIcon={<Plus className="w-4 h-4" />} className="w-full sm:w-auto">
                Ajouter la note
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {academicGrades.map((g, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900 block">{g.subject}</span>
                    <span className="text-emerald-700 font-bold text-sm">{g.grade} / 20</span>
                  </div>
                  <button
                    onClick={() => handleRemoveGrade(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Compétences Déclarées */}
        <Card className="md:col-span-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm">4. Compétences & Savoir-faire maîtrisés</CardTitle>
            <CardDescription>
              Ajoutez vos compétences pratiques (programmation, outils, logiciels, langues, techniques).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
            <div className="flex gap-2 max-w-md">
              <Input
                placeholder="ex: Python, AutoCAD, SEO, Marketing Digital"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <Button size="sm" onClick={handleAddSkill} leftIcon={<Plus className="w-4 h-4" />} className="shrink-0">
                Ajouter
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
              {skills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-full text-xs font-medium"
                >
                  {sk}
                  <button
                    onClick={() => handleRemoveSkill(sk)}
                    className="hover:text-rose-600 p-0.5 rounded ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Floating Action Bar */}
      <div className="p-3.5 sm:p-4 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky bottom-3 sm:bottom-4 z-20">
        <span className="text-xs text-slate-600 font-medium">
          Vos modifications sont enregistrées localement dans votre navigateur.
        </span>
        <Button onClick={handleSave} leftIcon={<Save className="w-4 h-4" />} className="w-full sm:w-auto">
          Sauvegarder le profil
        </Button>
      </div>
    </div>
  );
}
