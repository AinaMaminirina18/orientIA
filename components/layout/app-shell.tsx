"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { GlobalSearchModal } from "./global-search-modal";
import { ToastProvider } from "@/lib/useToast";
import { LenisProvider } from "./lenis-provider";
import { BackgroundDecorations } from "./background-decorations";

export function AppShellContent({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global keydown shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <LenisProvider>
      <div className="relative flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-900">
        {/* Animated Background Icons (subtle low-opacity) */}
        <BackgroundDecorations />

        {/* Sidebar */}
        <Sidebar
          onOpenGlobalSearch={() => setIsSearchOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden z-10">
          <Header onOpenGlobalSearch={() => setIsSearchOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
            <div className="max-w-7xl mx-auto space-y-6">{children}</div>
          </main>
        </div>

        {/* Global Modals */}
        <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </div>
    </LenisProvider>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppShellContent>{children}</AppShellContent>
    </ToastProvider>
  );
}
