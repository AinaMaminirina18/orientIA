"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "slate" | "indigo" | "emerald" | "amber" | "rose" | "outline" | "primary" | "secondary";
  size?: "sm" | "md";
}

export function Badge({
  children,
  className,
  variant = "emerald",
  size = "md",
  ...props
}: BadgeProps) {
  const baseStyles = "inline-flex items-center font-medium rounded-full tracking-tight shrink-0 select-none";

  const variants = {
    emerald: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    primary: "bg-emerald-600 text-white border border-emerald-600 font-semibold",
    secondary: "bg-slate-100 text-slate-700 border border-slate-200",
    slate: "bg-slate-100 text-slate-700 border border-slate-200",
    indigo: "bg-indigo-50 text-indigo-700 border border-indigo-200/80",
    amber: "bg-amber-50 text-amber-800 border border-amber-200/80",
    rose: "bg-rose-50 text-rose-700 border border-rose-200/80",
    outline: "bg-transparent text-slate-600 border border-slate-300",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-0.5 text-xs",
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {children}
    </span>
  );
}
