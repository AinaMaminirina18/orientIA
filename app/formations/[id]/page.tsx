"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Briefcase,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useFormations, useSources } from "@/lib/useStore";

export default function FormationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { getFormation, isMounted } = useFormations();
  const { sources } = useSources();

  if (!isMounted) return null;

  const formation = getFormation(id);

  if (!formation) {
    return (
      <div className="space-y-6">
        <Link href="/formations">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Retour aux formations
          </Button>
        </Link>
        <EmptyState title="Formation introuvable" description="Le parcours demandé n'existe pas." />
      </div>
    );
  }

  const linkedSources = sources.filter((s) => formation.sourceRefs.includes(s.id));

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back Button */}
      <div>
        <Link href="/formations">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Retour au catalogue
          </Button>
        </Link>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Mention : {formation.mention}
              </span>
              <Badge variant="emerald">{formation.degreeLevel.toUpperCase()}</Badge>
              <Badge variant="secondary">{formation.durationYears} ans d'études</Badge>
              <span className="text-xs font-mono font-bold text-slate-500">Code: {formation.code}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formation.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{formation.description}</p>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-2">
            {formation.matchScore && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-800 font-semibold block uppercase">Adéquation Profil</span>
                <span className="text-2xl font-bold text-emerald-700">{formation.matchScore}%</span>
              </div>
            )}
            <Link href="/orientation">
              <Button size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
                Tester mon éligibilité
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Key Curriculum & Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Subjects */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <CardTitle>Matières Clés du Syllabus</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {formation.keySubjects.map((sub, i) => (
              <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2.5 text-xs text-slate-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{sub}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Developed Skills */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <CardTitle>Compétences Développées</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {formation.skillsDeveloped.map((sk, i) => (
              <div key={i} className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-950 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{sk}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Prerequisites */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              <CardTitle>Prérequis d'Admission</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-600 leading-relaxed">
            {formation.prerequisites.map((pre, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-bold text-emerald-700">•</span>
                <span>{pre}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Career Outcomes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              <CardTitle>Débouchés Professionnels</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-600">
            {formation.careerOutcomes.map((out, i) => (
              <div key={i} className="p-2 bg-slate-50 rounded border border-slate-200 font-semibold text-slate-800">
                {out}
              </div>
            ))}

            {formation.passerelles && formation.passerelles.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">Passerelles Académiques :</span>
                {formation.passerelles.map((pass, i) => (
                  <p key={i} className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                    {pass}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RAG Sources Citations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <CardTitle>Sources Documentaires ISPM Associées</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {linkedSources.map((src) => (
            <div key={src.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{src.title}</span>
                <Badge variant="emerald" size="sm">{src.type}</Badge>
              </div>
              <p className="text-slate-600 italic text-[11px]">
                &quot;{src.extractedSnippet}&quot;
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
