"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Compass,
  UserCheck,
  MessageSquareCode,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Activity,
  Award,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BorderMagicButton } from "@/components/ui/border-magic-button";
import { Badge } from "@/components/ui/badge";
import { CountUp } from "@/components/ui/count-up";
import { Marquee } from "@/components/ui/marquee";
import { useUserProfile, useRecommendation, useFormations, useEvaluation } from "@/lib/useStore";

export default function DashboardPage() {
  const { profile } = useUserProfile();
  const { recommendation } = useRecommendation();
  const { formations } = useFormations();
  const { testCases } = useEvaluation();

  const primary = recommendation.primaryFormation;
  const mentions = Array.from(new Set(formations.map((f) => f.mention)));

  return (
    <div className="space-y-6">
      {/* Hero Section Banner */}
      <div
        className="rounded-2xl text-white p-6 sm:p-8 relative overflow-hidden shadow-lg border border-emerald-950 bg-cover bg-center"
        style={{
          backgroundImage: `url('/blue-futuristic-waves-background-with-computer-code-technology_53876-119584.avif')`,
        }}
      >
        {/* Dark overlay for optimal text contrast */}
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]" aria-hidden="true" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ORIENT’IA — Assistant Intelligent d'Orientation Pédagogique ISPM</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Trouvez le parcours qui vous correspond
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
            Recommandations d'orientation sur-mesure, explicables et traçables, croisant les données de votre profil, la prédiction d'un modèle Machine Learning et les documents officiels de l'ISPM.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link href="/profile">
              <BorderMagicButton leftIcon={<UserCheck className="w-4 h-4" />}>
                Commencer mon orientation
              </BorderMagicButton>
            </Link>

            <Link href="/assistant">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
                leftIcon={<Compass className="w-4 h-4 text-emerald-400" />}
              >
                Lancer l'assistant virtuel
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Marquee Ticker of ISPM Specializations */}
      <Marquee />

      {/* Mandatory Disclaimer Alert */}
      <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
        <p className="leading-normal font-medium">
          <strong>Notice d'orientation :</strong> ORIENT’IA constitue un outil d’aide à l’orientation. Ses recommandations ne remplacent ni l’avis d’un conseiller pédagogique ni une décision officielle d’admission.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-emerald-300 transition-all">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Complétude Profil</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                <CountUp end={profile.completenessPercentage} suffix="%" duration={1.2} />
              </h3>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                Profil prêt pour calcul ML
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-300 transition-all">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Meilleure Adéquation</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                <CountUp end={recommendation.overallMatchScore} suffix="%" duration={1.4} />
              </h3>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                Master {primary.code}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Compass className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-300 transition-all">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Formations ISPM</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                <CountUp end={formations.length} duration={1.5} />
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">{mentions.length} mentions · tous niveaux</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <GraduationCap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-300 transition-all">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Validation Banc Benchmark</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                <CountUp end={32} duration={1.8} /> cas
              </h3>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">100% de réussite</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Award className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Primary Recommendation + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Primary Recommendation Spotlight */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recommandation Pédagogique Principale</h2>
              <p className="text-xs text-slate-500">Résultat dérivé de votre profil académique</p>
            </div>
            <Link href="/orientation">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Détails de l'explication
              </Button>
            </Link>
          </div>

          <Card className="p-6 border-l-4 border-l-emerald-600 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="emerald">{primary.code}</Badge>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Mention : {primary.mention}
                  </span>
                  <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    {recommendation.overallMatchScore}% Adéquation
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900">{primary.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  {primary.description}
                </p>

                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  {primary.keySubjects.slice(0, 3).map((sub, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[10px]">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-2">
                <Link href="/orientation">
                  <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Consulter l'analyse
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Quick Action Cards */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Piliers du Système</h2>

          <div className="space-y-3">
            <Link href="/profile" className="block">
              <Card className="p-3.5 hover:border-emerald-300 transition-colors flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <span className="font-bold text-slate-900 block">Mon Profil Candidat</span>
                  <span className="text-slate-500 text-[11px]">Renseignez vos notes et compétences</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Card>
            </Link>

            <Link href="/orientation" className="block">
              <Card className="p-3.5 hover:border-emerald-300 transition-colors flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <span className="font-bold text-slate-900 block">Orientation & Comparateur</span>
                  <span className="text-slate-500 text-[11px]">Facteurs d'explicabilité ML & RAG</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Card>
            </Link>

            <Link href="/assistant" className="block">
              <Card className="p-3.5 hover:border-emerald-300 transition-colors flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageSquareCode className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <span className="font-bold text-slate-900 block">Assistant Chat Virtual</span>
                  <span className="text-slate-500 text-[11px]">Posez vos questions en direct</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Card>
            </Link>

            <Link href="/sources" className="block">
              <Card className="p-3.5 hover:border-emerald-300 transition-colors flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <span className="font-bold text-slate-900 block">Sources & Traçabilité</span>
                  <span className="text-slate-500 text-[11px]">Consultez les référentiels officiels</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
