"use client";

import React from "react";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  // Native CSS smooth scrolling provides 0ms latency and 60/120fps hardware acceleration
  return <>{children}</>;
}
