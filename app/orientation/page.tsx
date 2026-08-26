"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Cpu,
  Boxes,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  BarChart2,
  Columns,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { CountUp } from "@/components/ui/count-up";
import { useRecommendation, useUserProfile, useFormations, useSources } from "@/lib/useStore";

export default function OrientationPage() {
  const { recommendation } = useRecommendation();
  const { profile } = useUserProfile();
  const { formations } = useFormations();
  const { sources } = useSources();

  const [activeTab, setActiveTab] = useState<string>("recommendation");
  const [compareTrack1, setCompareTrack1] = useState<string>("form-isaia");
  const [compareTrack2, setCompareTrack2] = useState<string>("form-igglia");

  const primary = recommendation.primaryFormation;
  const secondary = recommendation.secondaryFormations;

  const track1 = formations.find((f) => f.id === compareTrack1) || formations[0];
  const track2 = formations.find((f) => f.id === compareTrack2) || formations[1];

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge variant="emerald">Confiance Élevée (87%)</Badge>;
      case "medium":
        return <Badge variant="amber">Confiance Modérée</Badge>;
      case "low":
        return <Badge variant="slate">Confiance Faible</Badge>;
      default:
        return <Badge variant="rose">Informations Insuffisantes</Badge>;
    }
  };

  const tabs = [
    { id: "recommendation", label: "Ma Recommandation AI" },
    { id: "explicability", label: "Explicabilité & Facteurs ML" },
    { id: "compare", label: "Comparateur de Parcours ISPM" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Orientation Pédagogique Basée sur l'IA</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Analyse d'Adéquation & Recommandation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Résultats croisés du modèle ML, des documents officiels ISPM et de la vérification symbolique.
          </p>
        </div>

        <Link href="/profile">
          <Button variant="outline" size="sm" leftIcon={<Sparkles className="w-4 h-4 text-emerald-600" />}>
            Modifier mon profil ({profile.completenessPercentage}%)
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: Main Recommendation */}
      {activeTab === "recommendation" && (
        <div className="space-y-6">
          {/* Main Recommended Hero Card */}
          <div className="bg-emerald-950 text-white rounded-2xl p-6 sm:p-8 border border-emerald-900 shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                    Parcours Recommandé N°1
                  </span>
                  {getConfidenceBadge(recommendation.confidenceLevel)}
                </div>
                <span className="text-xs text-emerald-300 font-mono">Code: {primary.code}</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {primary.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 max-w-2xl leading-relaxed">
                    {primary.description}
                  </p>
                </div>

                <div className="bg-emerald-900/80 p-4 rounded-xl border border-emerald-700 text-center shrink-0 min-w-[140px]">
                  <span className="text-[10px] text-emerald-300 font-semibold block uppercase">
                    Score d'adéquation ML
                  </span>
                  <span className="text-3xl font-extrabold text-white mt-1 block">
                    <CountUp end={recommendation.overallMatchScore} suffix="%" duration={1.5} />
                  </span>
                </div>
              </div>

              {/* Quick Matching Factors Summary */}
              <div className="pt-4 border-t border-emerald-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Mathématiques & Data : <strong>92% de match</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Python & Algorithmique : <strong>95% de match</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Prérequis L3 : <strong>Validés (16.5/20)</strong></span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link href={`/formations/${primary.id}`}>
                  <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border-none">
                    Consulter la fiche formation {primary.code}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="bg-emerald-900/40 text-white border-emerald-700 hover:bg-emerald-800/50"
                  onClick={() => setActiveTab("explicability")}
                >
                  Pourquoi cette recommandation ?
                </Button>
              </div>
            </div>
          </div>

          {/* Secondary Recommendations */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">
              Autres parcours à forte compatibilité
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {secondary.map((f) => (
                <Card key={f.id} className="p-5 flex flex-col justify-between hover:border-slate-300">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="emerald" size="sm">
                        {f.degreeLevel.toUpperCase()} • {f.durationYears} ans
                      </Badge>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {f.matchScore || 78}% Match
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {f.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Code: {f.code}</span>
                    <Link
                      href={`/formations/${f.id}`}
                      className="font-semibold text-emerald-700 hover:text-emerald-900 transition-colors flex items-center gap-1"
                    >
                      Découvrir
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Explicability & Factor Breakdown */}
      {activeTab === "explicability" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: ML Factors */}
            <Card className="lg:col-span-2 space-y-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-emerald-600" />
                  <CardTitle>Facteurs d'adéquation calculés par le modèle ML</CardTitle>
                </div>
                <CardDescription>
                  Pondération des critères académiques et techniques issus de votre profil déclaratif.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendation.matchingFactors.map((factor, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-800">{factor.label} ({factor.category})</span>
                      <span className="text-emerald-700 font-bold">{factor.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Right: Confidence Explanation */}
            <Card className="space-y-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <CardTitle>Prudence & Limites de l'IA</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>{recommendation.confidenceExplanation}</p>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 space-y-1">
                  <span className="font-semibold block flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Notice d'incertitude :
                  </span>
                  <p className="text-[11px]">
                    Cette recommandation est une aide algorithmique basée sur vos données déclarées. Elle ne garantit pas l'admission administrative.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3 Pillars of Explicability: ML vs RAG vs Symbolic Rules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pillar 1: ML Model */}
            <Card className="p-5 border-l-4 border-l-indigo-600">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs mb-2">
                <Cpu className="w-4 h-4" />
                <span>1. Prédiction Modèle ML</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">{recommendation.mlModelPrediction.modelName}</h4>
              <p className="text-[11px] text-slate-500 font-mono mt-1 bg-slate-50 p-2 rounded border border-slate-200">
                {recommendation.mlModelPrediction.rawOutput}
              </p>
            </Card>

            {/* Pillar 2: RAG Sources */}
            <Card className="p-5 border-l-4 border-l-emerald-600">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs mb-2">
                <BookOpen className="w-4 h-4" />
                <span>2. Sources Documentaires RAG</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">{recommendation.ragSourcesUsed.length} document(s) vérifié(s)</h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Extraits de la plaquette officielle et du syllabus d'admission 2026.
              </p>
            </Card>

            {/* Pillar 3: Symbolic Rules */}
            <Card className="p-5 border-l-4 border-l-amber-600">
              <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs mb-2">
                <Boxes className="w-4 h-4" />
                <span>3. Règles Pédagogiques Symboliques</span>
              </div>
              <div className="space-y-1 mt-1">
                {recommendation.symbolicRuleValidation.map((r, i) => (
                  <div key={i} className="text-[11px] text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{r.ruleName}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: Side-by-Side Track Comparison */}
      {activeTab === "compare" && (
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4">
              Sélectionnez deux parcours ISPM à comparer côte à côte
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Select
                label="Parcours N°1"
                value={compareTrack1}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCompareTrack1(e.target.value)}
                options={formations.map((f) => ({ value: f.id, label: `${f.code} — ${f.title}` }))}
              />
              <Select
                label="Parcours N°2"
                value={compareTrack2}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCompareTrack2(e.target.value)}
                options={formations.map((f) => ({ value: f.id, label: `${f.code} — ${f.title}` }))}
              />
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              {/* Track 1 Column */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <Badge variant="emerald">{track1.code}</Badge>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{track1.title}</h3>
                  </div>
                  <span className="text-xl font-extrabold text-emerald-700">{track1.matchScore || 80}%</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 block mb-1">Matières Clés :</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {track1.keySubjects.slice(0, 3).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 block mb-1">Prérequis :</span>
                    <p className="text-slate-600 leading-normal">{track1.prerequisites[0]}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 block mb-1">Débouchés :</span>
                    <p className="text-slate-600">{track1.careerOutcomes.slice(0, 2).join(", ")}</p>
                  </div>
                </div>
              </div>

              {/* Track 2 Column */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <Badge variant="slate">{track2.code}</Badge>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{track2.title}</h3>
                  </div>
                  <span className="text-xl font-extrabold text-slate-700">{track2.matchScore || 75}%</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 block mb-1">Matières Clés :</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {track2.keySubjects.slice(0, 3).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 block mb-1">Prérequis :</span>
                    <p className="text-slate-600 leading-normal">{track2.prerequisites[0]}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 block mb-1">Débouchés :</span>
                    <p className="text-slate-600">{track2.careerOutcomes.slice(0, 2).join(", ")}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Mandatory Disclaimer Footer */}
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed text-center font-medium">
        ORIENT’IA constitue un outil d’aide à l’orientation. Ses recommandations ne remplacent ni l’avis d’un conseiller pédagogique ni une décision officielle d’admission.
      </div>
    </div>
  );
}
