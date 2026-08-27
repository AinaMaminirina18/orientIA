"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  LayoutDashboard,
  UserCheck,
  Compass,
  GraduationCap,
  MessageSquareCode,
  BookOpenCheck,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useUserProfile } from "@/lib/useStore";

export interface SidebarProps {
  onOpenGlobalSearch: () => void;
}

export function Sidebar({ onOpenGlobalSearch }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { profile } = useUserProfile();

  const navItems = [
    { label: "Vue d'ensemble", href: "/", icon: LayoutDashboard },
    {
      label: "Mon Profil Candidat",
      href: "/profile",
      icon: UserCheck,
      badge: `${profile.completenessPercentage}%`,
    },
    { label: "Orientation & Match", href: "/orientation", icon: Compass },
    { label: "Formations ISPM", href: "/formations", icon: GraduationCap },
    { label: "Assistant Chat", href: "/assistant", icon: MessageSquareCode },
    { label: "Sources & Traçabilité", href: "/sources", icon: BookOpenCheck },
    { label: "Évaluation & Traces", href: "/evaluation", icon: ShieldCheck },
    { label: "Paramètres", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-3 left-3 z-40">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 bg-white rounded-md border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 focus:outline-none"
          aria-label="Afficher le menu de navigation"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-2xs"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={twMerge(
          clsx(
            "fixed lg:static inset-y-0 left-0 z-40 bg-slate-900 text-slate-300 flex flex-col transition-all duration-200 border-r border-slate-800 shadow-lg lg:shadow-none select-none",
            isCollapsed ? "lg:w-16" : "lg:w-64",
            isMobileOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0"
          )
        )}
      >
        {/* Header Branding */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800">
          <Link
            href="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 p-1 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Image
                src="/ISPM.ico"
                alt="ISPM Logo"
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-white tracking-wide truncate flex items-center gap-1">
                  ORIENT’IA
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </span>
                <span className="text-[10px] text-emerald-400 font-medium truncate">
                  Assistant ISPM M2
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            aria-label={isCollapsed ? "Déplier la navigation" : "Replier la navigation"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Profile CTA Header */}
        <div className="p-3">
          <Link href="/profile" onClick={() => setIsMobileOpen(false)}>
            <div
              className={twMerge(
                clsx(
                  "w-full flex items-center justify-between bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-200 rounded-md p-2.5 text-xs transition-colors",
                  isCollapsed && "justify-center"
                )
              )}
            >
              <div className="flex items-center gap-2 truncate">
                {!isCollapsed && (
                  <div className="flex flex-col text-left truncate">
                    <span className="font-semibold text-white truncate">Mon Profil Candidat</span>
                    <span className="text-[10px] text-emerald-400">
                      Complété à {profile.completenessPercentage}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={clsx(
                  "flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors group relative",
                  isActive
                    ? "bg-slate-800 text-white font-semibold border-l-2 border-emerald-500"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={clsx(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-300"
                    )}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-800 font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-800 text-[10px] text-slate-400 flex flex-col gap-1">
            <span className="font-semibold text-slate-300">ISPM Orientation System</span>
            <span className="text-[9px] text-slate-400 leading-normal">
              Recommandations explicables & traçables
            </span>
          </div>
        )}
      </aside>
    </>
  );
}
