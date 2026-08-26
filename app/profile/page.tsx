"use client";

import React, { useState } from "react";
import {
  UserCheck,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Save,
  Plus,
  Trash2,
  Compass,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUserProfile, useRecommendation } from "@/lib/useStore";
import { useToast } from "@/lib/useToast";
import { UserProfile } from "@/lib/types";
import Link from "next/link";

export default function ProfilePage() {
  const { profile, updateProfile } = useUserProfile();
  const { recompute } = useRecommendation();
  const { toast } = useToast();

  const [name, setName] = useState(profile.name);
  const [currentLevel, setCurrentLevel] = useState(profile.currentLevel);
  const [preferredWorkEnv, setPreferredWorkEnv] = useState(profile.preferredWorkEnvironment);

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
    const updated = updateProfile({
      name,
      currentLevel,
      preferredSubjects: subjects,
      academicGrades,
      declaredSkills: skills,
      preferredWorkEnvironment: preferredWorkEnv as UserProfile["preferredWorkEnvironment"],
    });

    recompute();

    toast({
      type: "success",
      title: "Profil sauvegardé avec succès",
      description: `Le profil a été mis à jour. Complitude : ${updated.completenessPercentage}%.`,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
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

        <div className="flex items-center gap-3">
          <Button
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSave}
          >
            Enregistrer le profil
          </Button>
          <Link href="/orientation">
            <Button variant="secondary" leftIcon={<Compass className="w-4 h-4" />}>
              Voir les matchs
            </Button>
          </Link>
        </div>
      </div>

      {/* Completeness Gauge Card */}
      <Card className="bg-emerald-950 text-white border-emerald-900 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Niveau de complétude du profil
              </span>
              <span className="text-lg font-bold text-white">
                {profile.completenessPercentage}%
              </span>
            </div>
            <div className="w-full h-3 bg-emerald-900 rounded-full overflow-hidden p-0.5 border border-emerald-700">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${profile.completenessPercentage}%` }}
              />
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              {profile.completenessPercentage >= 80
                ? "Profil suffisamment renseigné pour produire une recommandation à haute confiance."
                : "Renseignez vos notes et compétences pour augmenter la précision du modèle ML."}
            </p>
          </div>

          {profile.missingInfo && profile.missingInfo.length > 0 && (
            <div className="p-3.5 bg-emerald-900/60 rounded-lg border border-emerald-700 text-xs space-y-1 max-w-xs shrink-0">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
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
      </Card>

      {/* Form Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Informations Générales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">1. Statut & Niveau d'études</CardTitle>
            <CardDescription>Déclarez votre niveau académique actuel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nom / Identifiant"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Select
              label="Niveau d'études actuel"
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value)}
              options={[
                { value: "Baccalauréat Scientifique", label: "Baccalauréat Scientifique / C" },
                { value: "Licence 1/2 Informatique", label: "Licence 1/2 Informatique ou Math-Info" },
                { value: "Licence 3 Informatique", label: "Licence 3 Informatique validée" },
                { value: "Master 1 Scientifique", label: "Master 1 Scientifique / Ingéniorat" },
              ]}
            />

            <Select
              label="Environnement de travail recherché"
              value={preferredWorkEnv}
              onChange={(e) => setPreferredWorkEnv(e.target.value as UserProfile["preferredWorkEnvironment"])}
              options={[
                { value: "data_ia", label: "Intelligence Artificielle & Data Science" },
                { value: "developpement", label: "Développement Logiciel & Cloud" },
                { value: "reseaux_cloud", label: "Réseaux, IoT & Cybersécurité" },
                { value: "management", label: "Gestion de Projet & Data Analytics" },
              ]}
            />
          </CardContent>
        </Card>

        {/* Section 2: Matières Préférées */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">2. Matières préférentielles</CardTitle>
            <CardDescription>Matières scientifiques et techniques qui vous passionnent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="ex: Algèbre Linéaire, Deep Learning"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
              <Button size="sm" onClick={handleAddSubject} leftIcon={<Plus className="w-4 h-4" />}>
                Ajouter
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {subjects.map((sub) => (
                <span
                  key={sub}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold"
                >
                  {sub}
                  <button
                    onClick={() => handleRemoveSubject(sub)}
                    className="hover:text-rose-600 p-0.5 rounded"
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
          <CardHeader>
            <CardTitle className="text-sm">3. Résultats & Notes obtenues (/20)</CardTitle>
            <CardDescription>
              Ces notes sont utilisées par le modèle ML de prédiction et la vérification des règles d'admissibilité.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Button size="sm" onClick={handleAddGrade} leftIcon={<Plus className="w-4 h-4" />}>
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
      </div>

      {/* Save Floating Action Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between sticky bottom-4 z-20">
        <span className="text-xs text-slate-600 font-medium">
          Vos modifications sont enregistrées localement dans votre navigateur.
        </span>
        <Button onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
          Sauvegarder le profil
        </Button>
      </div>
    </div>
  );
}
