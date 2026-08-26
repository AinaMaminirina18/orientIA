"use client";

import React, { useState } from "react";
import {
  BookOpenCheck,
  Search,
  ExternalLink,
  ShieldCheck,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { useSources } from "@/lib/useStore";

export default function SourcesPage() {
  const { sources } = useSources();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "all", label: "Toutes les sources", count: sources.length },
    {
      id: "official_ispm",
      label: "Sources Officielles ISPM",
      count: sources.filter((s) => s.type === "official_ispm").length,
    },
  ];

  const filtered = sources.filter((s) => {
    const matchesTab = activeTab === "all" || s.type === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.extractedSnippet.toLowerCase().includes(q);
    return matchesTab && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-2">
            <BookOpenCheck className="w-3.5 h-3.5" />
            <span>Traçabilité Documentaire RAG</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Registre des Sources Pédagogiques & Citations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chaque recommandation produit par ORIENT’IA s'appuie sur des documents officiels vérifiés et horodatés.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre de document, extrait..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filtered.length} document(s)
        </span>
      </div>

      {/* RAG Visual Pipeline Card */}
      <Card className="bg-slate-900 text-white p-6">
        <h3 className="text-sm font-bold text-emerald-400 mb-2">Pipeline de Traçabilité RAG</h3>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Pour éviter toute hallucination, le système extrait les passages pertinents des référentiels officiels avant de formuler une recommandation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
            <span className="font-semibold text-slate-200 block">1. Profil Candidat</span>
            <span className="text-[10px] text-slate-400">Notes & Intérêts</span>
          </div>
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
            <span className="font-semibold text-emerald-400 block">2. Vector Search</span>
            <span className="text-[10px] text-slate-400">Index RAG ISPM</span>
          </div>
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
            <span className="font-semibold text-slate-200 block">3. Passages Extraits</span>
            <span className="text-[10px] text-slate-400">Syllabus & Règles</span>
          </div>
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
            <span className="font-semibold text-emerald-400 block">4. Citation finale</span>
            <span className="text-[10px] text-slate-400">Réponse justifiée</span>
          </div>
        </div>
      </Card>

      {/* Sources List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-slate-400" />}
          title="Aucune source trouvée"
          description="Aucune source ne correspond à vos mots-clés."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => (
            <Card key={s.id} className="p-5 hover:border-emerald-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="emerald" size="sm">
                      {s.type === "official_ispm" ? "Officielle ISPM" : s.type}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Statut: {s.reliabilityStatus}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{s.title}</h3>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 italic">
                    &quot;{s.extractedSnippet}&quot;
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Consulté le {new Date(s.consultedAt).toLocaleDateString("fr-FR")}
                    </span>
                    {s.originUrl && (
                      <a
                        href={s.originUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                      >
                        Source PDF / URL
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
