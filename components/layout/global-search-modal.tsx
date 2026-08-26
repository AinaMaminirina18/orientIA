"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, GraduationCap, BookOpenCheck, ArrowRight, X, UserCheck } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useFormations, useSources, useUserProfile } from "@/lib/useStore";
import { Badge } from "@/components/ui/badge";

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { formations } = useFormations();
  const { sources } = useSources();
  const { profile } = useUserProfile();

  useEffect(() => {
    if (isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  const q = query.trim().toLowerCase();

  const matchingFormations = q
    ? formations.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.code.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.keySubjects.some((s) => s.toLowerCase().includes(q))
      )
    : formations.slice(0, 3);

  const matchingSources = q
    ? sources.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.extractedSnippet.toLowerCase().includes(q)
      )
    : sources.slice(0, 2);

  const totalResults = matchingFormations.length + matchingSources.length;

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Recherche Pédagogique Globale" maxWidth="lg">
      <div className="flex flex-col gap-4">
        {/* Search Bar Input */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un parcours (ISAIA, IGGLIA), une matière, un document..."
            className="w-full h-10 pl-9 pr-8 text-sm bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
          {q && totalResults === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Aucune formation ni document ne correspond à &quot;<span className="font-semibold">{query}</span>&quot;
            </div>
          ) : (
            <>
              {/* Formations Section */}
              {matchingFormations.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2 px-1">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Formations ISPM ({matchingFormations.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchingFormations.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => navigateTo(`/formations/${f.id}`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 text-left transition-colors group"
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 truncate">
                            {f.code} — {f.title}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate">{f.description}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="emerald" size="sm">
                            {f.degreeLevel.toUpperCase()}
                          </Badge>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* RAG Sources Section */}
              {matchingSources.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2 px-1">
                    <BookOpenCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sources RAG Citées ({matchingSources.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchingSources.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => navigateTo(`/sources`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 text-left transition-colors group"
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 truncate">
                            {s.title}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate">
                            &quot;{s.extractedSnippet}&quot;
                          </span>
                        </div>
                        <Badge variant="slate" size="sm">
                          {s.type}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>{q ? `${totalResults} résultat(s)` : "Recherche rapide dans le référentiel"}</span>
          <button
            onClick={() => navigateTo(`/search?q=${encodeURIComponent(query)}`)}
            className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
          >
            <span>Voir tous les détails</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </Dialog>
  );
}
