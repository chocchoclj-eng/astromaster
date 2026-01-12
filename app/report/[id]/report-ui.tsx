// app/report/[id]/report-ui.tsx
"use client";

import React from "react";

export function cn(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

export function SegTab({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-xs transition",
        active
          ? "border-white/20 bg-white/10 text-white"
          : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
}

export function SectionTitle({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <span className="text-white/90">{icon}</span>
        <span>{title}</span>
      </div>
      {desc ? <div className="mt-1 text-sm text-white/60">{desc}</div> : null}
    </div>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      {children}
    </div>
  );
}

export function CodeBlock({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">
        {text}
      </pre>
    </div>
  );
}

export function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 whitespace-pre-wrap">
      {children}
    </div>
  );
}