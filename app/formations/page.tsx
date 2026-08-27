"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  ArrowRight,
  Layers,
  Cpu,
  Hammer,
  Building2,
  Scale,
  Leaf,
  Palmtree,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useFormations, useUserProfile } from "@/lib/useStore";
import { ISPMFormation } from "@/lib/types";
import { computeFormationsWithMatch } from "@/lib/adequacyCalculator";

// Icon & color per mention
const MENTION_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  "Informatique et Télécommunications": {
    icon: Cpu,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  "Génie Industriel": {
    icon: Hammer,
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  "Génie Civil et Architecture": {
    icon: Building2,
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
  },
  "Droit et Techniques des Affaires": {
    icon: Scale,
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  "Biotechnologie et Agronomie": {
    icon: Leaf,
    color: "text-lime-700",
    bg: "bg-lime-50",
    border: "border-lime-200",
  },
  "Tourisme": {
    icon: Palmtree,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
};

export default function FormationsCataloguePage() {
  const { formations } = useFormations();
  const { profile } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMention, setActiveMention] = useState<string>("all");

  // Dynamically evaluate adequacy score & match reasons for each formation against candidate's profile
  const evaluatedFormations = computeFormationsWithMatch(formations, profile);

  // Build unique mentions list preserving order
  const mentions = Array.from(new Set(evaluatedFormations.map((f) => f.mention)));

  // Filter
  const filtered = evaluatedFormations.filter((f) => {
    const matchesMention = activeMention === "all" || f.mention === activeMention;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      f.title.toLowerCase().includes(q) ||
      f.code.toLowerCase().includes(q) ||
      f.mention.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.keySubjects.some((s) => s.toLowerCase().includes(q));
    return matchesMention && matchesSearch;
  });

  // Group filtered by mention
  const groupedByMention = mentions.reduce<Record<string, ISPMFormation[]>>((acc, mention) => {
    const inMention = filtered.filter((f) => f.mention === mention);
    if (inMention.length > 0) acc[mention] = inMention;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Catalogue Officiel ISPM — ispm-edu.com</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Offre de Formation & Parcours Académiques
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {formations.length} parcours répartis en {mentions.length} mentions — Niveau Master (Bac+5)
          </p>
        </div>
      </div>

      {/* Search + Mention Filter Bar */}
      <div className="w-full max-w-full min-w-0 overflow-hidden flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher (ex: ISAIA, IA, Droit, Chimie)..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
          />
        </div>

        {/* Mention filter pills — contained scrollable container */}
        <div className="min-w-0 flex-1 w-full max-w-full overflow-x-auto py-1 flex items-center gap-1.5 no-scrollbar">
          <button
            onClick={() => setActiveMention("all")}
            className={`shrink-0 px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
              activeMention === "all"
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Toutes ({formations.length})
          </button>
          {mentions.map((m) => {
            const count = formations.filter((f) => f.mention === m).length;
            return (
              <button
                key={m}
                onClick={() => setActiveMention(m)}
                className={`shrink-0 px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
                  activeMention === m
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {m.split(" ")[0]} ({count})
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-500 font-medium shrink-0 self-end lg:self-center font-mono">
          {filtered.length} parcours
        </span>
      </div>

      {/* Grouped Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-8 h-8 text-slate-400" />}
          title="Aucune formation trouvée"
          description="Aucun parcours ne correspond à vos mots-clés."
          actionLabel="Réinitialiser"
          onAction={() => { setSearchQuery(""); setActiveMention("all"); }}
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByMention).map(([mention, tracks]) => {
            const cfg = MENTION_CONFIG[mention] ?? {
              icon: Layers,
              color: "text-slate-700",
              bg: "bg-slate-50",
              border: "border-slate-200",
            };
            const Icon = cfg.icon;

            return (
              <div key={mention} className="space-y-3">
                {/* Mention Header */}
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                  <Icon className={`w-5 h-5 ${cfg.color} shrink-0`} />
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>
                      Mention
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">
                      {mention}
                    </h2>
                  </div>
                  <span className="ml-auto text-xs font-semibold text-slate-500">
                    {tracks.length} parcours
                  </span>
                </div>

                {/* Tracks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tracks.map((f) => (
                    <Card
                      key={f.id}
                      className={`p-5 flex flex-col justify-between hover:border-slate-300 group transition-colors`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${cfg.bg} ${cfg.color} ${cfg.border}`}
                            >
                              {f.code}
                            </span>
                            <Badge variant="secondary" size="sm">
                              Master • {f.durationYears} ans
                            </Badge>
                          </div>
                          {f.matchScore !== undefined && f.matchScore > 0 && (
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                              {f.matchScore}% Match
                            </span>
                          )}
                        </div>

                        <Link href={`/formations/${f.id}`}>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                            {f.title}
                          </h3>
                        </Link>

                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {f.description}
                        </p>

                        {f.matchReasons && f.matchReasons.length > 0 && (
                          <p className="text-[11px] text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 rounded px-2 py-1 leading-snug font-medium">
                            💡 {f.matchReasons[0]}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1.5">
                          {f.keySubjects.slice(0, 3).map((sub, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono"
                            >
                              {sub}
                            </span>
                          ))}
                          {f.keySubjects.length > 3 && (
                            <span className="text-[10px] text-slate-400 px-1 py-0.5">
                              +{f.keySubjects.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>{f.careerOutcomes.length} débouchés identifiés</span>
                        <Link
                          href={`/formations/${f.id}`}
                          className="font-bold text-emerald-700 hover:text-emerald-900 transition-colors flex items-center gap-1"
                        >
                          Fiche détaillée
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
