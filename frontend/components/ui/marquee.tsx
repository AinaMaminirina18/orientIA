"use client";

import React from "react";
import {
  Brain,
  GraduationCap,
  Cpu,
  Network,
  BarChart3,
  Hammer,
  Building2,
  Scale,
  Leaf,
  Palmtree,
  Microscope,
  BookOpen,
  Compass,
  ShieldCheck,
} from "lucide-react";

export function Marquee() {
  const items = [
    { label: "ISAIA — Informatique Statistique Appliquée & IA", icon: Brain },
    { label: "IGGLIA — Génie Logiciel & Intelligence Artificielle", icon: Cpu },
    { label: "ESIIA — Electronique, Systèmes Informatiques & IA", icon: Network },
    { label: "IMTICIA — Multimédia, TIC & Intelligence Artificielle", icon: GraduationCap },
    { label: "EMII — Electro-Mécanique & Informatique Industrielle", icon: Hammer },
    { label: "ICMP — Industries Chimiques, Minières & Pétrolières", icon: Microscope },
    { label: "GCA — Génie Civil & Architecture", icon: Building2 },
    { label: "CAA — Commerce & Administration des Affaires", icon: BarChart3 },
    { label: "EMP — Economie & Management de Projet", icon: Compass },
    { label: "FIC — Finances & Comptabilités", icon: Scale },
    { label: "DTJA — Droit et Techniques Juridiques des Affaires", icon: BookOpen },
    { label: "IAA — Industrie Agroalimentaire", icon: Leaf },
    { label: "AEE — Agriculture & Elevage", icon: Leaf },
    { label: "PIP — Pharmacologie & Industries Pharmaceutiques", icon: Microscope },
    { label: "TEE — Tourisme & Environnement", icon: Palmtree },
    { label: "TEH — Tourisme & Hôtellerie", icon: Palmtree },
    { label: "Recommandations Explicables & Traçables", icon: ShieldCheck },
  ];

  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="relative w-full overflow-hidden bg-white/90 backdrop-blur-xs border-y border-slate-200/80 py-2.5 my-2 shadow-2xs select-none">
      {/* Gradient Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-100 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-100 to-transparent z-10 pointer-events-none" />

      <div className="flex items-center gap-6 whitespace-nowrap animate-marquee">
        {duplicatedItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-xs font-semibold text-emerald-900 shrink-0 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
            >
              <Icon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
