"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Chargement des données..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 my-4 text-center">
      <Loader2 className="w-6 h-6 text-slate-700 animate-spin mb-3" />
      <p className="text-xs text-slate-500 font-medium">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse flex flex-col gap-3">
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      <div className="h-3 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between">
        <div className="h-3 bg-slate-200 rounded w-1/4" />
        <div className="h-3 bg-slate-200 rounded w-1/4" />
      </div>
    </div>
  );
}
