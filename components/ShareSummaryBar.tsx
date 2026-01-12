// components/ShareSummaryBar.tsx
"use client";

import React from "react";

export default function ShareSummaryBar({
  items,
}: {
  items: Array<{ k: string; v: string; icon?: string }>;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200/70 bg-zinc-50/60 p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {items.map((it) => (
          <div
            key={it.k}
            className="rounded-2xl bg-white border border-zinc-200/70 px-4 py-3 shadow-sm"
          >
            <div className="text-xs text-zinc-500 flex items-center gap-2">
              <span>{it.icon || "✨"}</span>
              <span className="font-medium">{it.k}</span>
            </div>
            <div className="mt-1 text-sm font-semibold text-zinc-900">{it.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
