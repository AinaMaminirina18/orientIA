"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  Database,
  Cpu,
  Network,
  Sparkles,
  Binary,
  FileCode,
  Share2,
  Workflow,
  Boxes,
} from "lucide-react";

export function BackgroundDecorations() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const icons = [
    { Icon: Brain, top: "12%", left: "5%", size: 48, duration: 12, delay: 0 },
    { Icon: Database, top: "28%", left: "88%", size: 56, duration: 14, delay: 1 },
    { Icon: Cpu, top: "55%", left: "8%", size: 42, duration: 10, delay: 2 },
    { Icon: Network, top: "75%", left: "92%", size: 52, duration: 15, delay: 0.5 },
    { Icon: Sparkles, top: "18%", left: "75%", size: 36, duration: 11, delay: 1.5 },
    { Icon: Binary, top: "42%", left: "94%", size: 44, duration: 13, delay: 2.5 },
    { Icon: FileCode, top: "68%", left: "4%", size: 50, duration: 14, delay: 3 },
    { Icon: Share2, top: "85%", left: "15%", size: 40, duration: 12, delay: 1.2 },
    { Icon: Workflow, top: "35%", left: "2%", size: 46, duration: 16, delay: 0.8 },
    { Icon: Boxes, top: "90%", left: "80%", size: 48, duration: 13, delay: 2.1 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {icons.map((item, i) => {
        const IconComponent = item.Icon;
        return (
          <div
            key={i}
            className="absolute text-slate-900 opacity-[0.04] animate-float-icon"
            style={{
              top: item.top,
              left: item.left,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
            }}
          >
            <IconComponent style={{ width: item.size, height: item.size }} />
          </div>
        );
      })}
    </div>
  );
}
