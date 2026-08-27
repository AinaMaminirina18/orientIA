"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search as SearchIcon,
  GraduationCap,
  BookOpenCheck,
  Compass,
  ArrowRight,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useFormations, useSources } from "@/lib/useStore";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState<"all" | "formations" | "sources">("all");

  const { formations } = useFormations();
  const { sources } = useSources();

  const q = query.trim().toLowerCase();

  const matchingFormations = formations.filter(
    (f) =>
      !q ||
      f.title.toLowerCase().includes(q) ||
      f.code.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.keySubjects.some((s) => s.toLowerCase().includes(q))
  );

  const matchingSources = sources.filter(
    (s) =>
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.extractedSnippet.toLowerCase().includes(q)
  );

  const showFormations = filterType === "all" || filterType === "formations";
  const showSources = filterType === "all" || filterType === "sources";

  const totalMatches =
    (showFormations ? matchingFormations.length : 0) +
    (showSources ? matchingSources.length : 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Search Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Moteur de Recherche Pédagogique
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explorez instantanément les spécialisations ISPM, matières, prérequis et documents officiels.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="w-5 h-5 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une formation, une matière (ex: ISAIA, Python, RAG, Mathématiques)..."
            className="w-full h-11 pl-11 pr-10 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 shadow-2xs"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Filtrer par :</span>
          {[
            { id: "all", label: "Tout (" + (matchingFormations.length + matchingSources.length) + ")" },
            { id: "formations", label: "Formations ISPM (" + matchingFormations.length + ")" },
            { id: "sources", label: "Sources RAG (" + matchingSources.length + ")" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterType(pill.id as typeof filterType)}
              className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
                filterType === pill.id
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Container */}
      {totalMatches === 0 ? (
        <EmptyState
          icon={<SearchIcon className="w-8 h-8 text-slate-400" />}
          title="Aucun résultat trouvé"
          description={`Aucune formation ni document ne correspond à la recherche "${query}".`}
          actionLabel="Effacer la recherche"
          onAction={() => setQuery("")}
        />
      ) : (
        <div className="space-y-6">
          {/* Formations Results */}
          {showFormations && matchingFormations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>Formations ISPM ({matchingFormations.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchingFormations.map((f) => (
                  <Card key={f.id} className="p-4 hover:border-emerald-300">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="emerald" size="sm">
                        {f.code}
                      </Badge>
                      <Badge variant="secondary" size="sm">
                        {f.degreeLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <Link href={`/formations/${f.id}`}>
                      <h3 className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors">
                        {f.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{f.description}</p>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-medium">
                      <span>{f.durationYears} ans d'études</span>
                      <Link href={`/formations/${f.id}`} className="flex items-center gap-1 hover:underline">
                        Consulter
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Sources Results */}
          {showSources && matchingSources.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpenCheck className="w-4 h-4 text-emerald-600" />
                  <span>Sources Documentaires ({matchingSources.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchingSources.map((s) => (
                  <Card key={s.id} className="p-4 hover:border-emerald-300">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-xs text-slate-900">{s.title}</span>
                      <Badge variant="emerald" size="sm">
                        {s.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200 line-clamp-2">
                      &quot;{s.extractedSnippet}&quot;
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingState message="Initialisation de la recherche..." />}>
      <SearchPageContent />
    </Suspense>
  );
}
