"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BorderMagicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function BorderMagicButton({
  children,
  className,
  leftIcon,
  rightIcon,
  onClick,
  ...props
}: BorderMagicButtonProps) {
  return (
    <button
      onClick={onClick}
      className={twMerge(
        clsx(
          "relative inline-flex h-9 overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 select-none group shrink-0 shadow-sm transition-transform active:scale-[0.98]",
          className
        )
      )}
      {...props}
    >
      {/* Spinning Conic Gradient in Emerald (Aceternity Border Magic Effect) */}
      <span className="absolute inset-[-1000%] animate-spin-slow bg-[conic-gradient(from_90deg_at_50%_50%,#34d399_0%,#064e3b_50%,#34d399_100%)] opacity-85 group-hover:opacity-100 transition-opacity" />

      {/* Inner Button Content */}
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-[5px] bg-slate-900 px-4 text-xs font-semibold text-white backdrop-blur-3xl gap-2 group-hover:bg-slate-800 transition-colors">
        {leftIcon && <span className="shrink-0 text-emerald-400">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </span>
    </button>
  );
}
