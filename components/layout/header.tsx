"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Search, Sparkles } from "lucide-react";
import { useFormations } from "@/lib/useStore";
import { ISPMFormation } from "@/lib/types";

export interface HeaderProps {
  onOpenGlobalSearch: () => void;
}

export function Header({ onOpenGlobalSearch }: HeaderProps) {
  const pathname = usePathname();
  const { formations } = useFormations();

  const segments = pathname.split("/").filter(Boolean);

  const getBreadcrumbLabel = (seg: string, index: number) => {
    if (seg === "profile") return "Mon Profil";
    if (seg === "orientation") return "Orientation";
    if (seg === "formations") return "Formations ISPM";
    if (seg === "assistant") return "Assistant Chat";
    if (seg === "sources") return "Sources & Traçabilité";
    if (seg === "evaluation") return "Évaluation & Traces";
    if (seg === "search") return "Recherche";
    if (seg === "settings") return "Paramètres";

    // If segment is a formation ID
    if (index > 0 && segments[index - 1] === "formations") {
      const form = formations.find(
        (f: ISPMFormation) =>
          f.id === seg || f.code.toLowerCase() === seg.toLowerCase(),
      );
      return form ? `${form.code} — ${form.title}` : seg;
    }
    return seg;
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 z-10 sticky top-0">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Fil d'Ariane"
        className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto pl-10 lg:pl-0"
      >
        <Link
          href="/"
          className="hover:text-slate-900 transition-colors font-medium"
        >
          Accueil ORIENT'IA
        </Link>
        {segments.map((seg, i) => {
          const href = "/" + segments.slice(0, i + 1).join("/");
          const isLast = i === segments.length - 1;
          const label = getBreadcrumbLabel(seg, i);

          return (
            <React.Fragment key={href}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              {isLast ? (
                <span className="font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-[300px]">
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-slate-900 transition-colors truncate max-w-[150px]"
                >
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Header Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenGlobalSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/80 rounded-md border border-slate-200 transition-colors"
          aria-label="Ouvrir la recherche globale"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Rechercher...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-300 text-slate-500 rounded ml-1 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200 text-emerald-800 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold hidden md:inline">ORIENT'IA ISPM M2</span>
        </div> */}
      </div>
    </header>
  );
}
