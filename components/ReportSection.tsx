// components/ReportSection.tsx
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown } from "lucide-react";

export default function ReportSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-3xl border border-zinc-200/70 bg-white shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <div className="text-base font-semibold text-zinc-900">{title}</div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>{open ? "收起" : "展开"}</span>
          <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="h-px bg-zinc-100 mb-4" />

          <div className="prose prose-zinc max-w-none prose-headings:scroll-mt-24 prose-h2:text-lg prose-h3:text-base">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              className="text-xs text-emerald-700 border border-emerald-200 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition"
            >
              ✅ 我认可
            </button>
            <button
              type="button"
              className="text-xs text-rose-700 border border-rose-200 bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100 transition"
            >
              ❌ 不太符合
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
