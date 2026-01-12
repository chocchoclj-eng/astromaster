"use client";

import { useState } from "react";

export default function DeepReportPanel({ id }: { id: string }) {
  const [mode, setMode] = useState<"A" | "B" | "C">("A");
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function run(m: "A" | "B" | "C") {
    setMode(m);
    setLoading(true);
    setError("");
    setText("");

    try {
      const res = await fetch("/api/deep-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, mode: m }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "生成失败");

      setText(data.text || "");
    } catch (e: any) {
      setError(e.message || "系统暂时不稳定，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">深度报告</h3>
        <div className="text-xs text-gray-400">A/B/C 不影响结构盘</div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => run("A")}
          className={`px-4 py-2 rounded-2xl border text-sm ${
            mode === "A" ? "bg-black text-white" : "bg-white"
          }`}
        >
          💗 关系 / 情感 A
        </button>
        <button
          onClick={() => run("B")}
          className={`px-4 py-2 rounded-2xl border text-sm ${
            mode === "B" ? "bg-black text-white" : "bg-white"
          }`}
        >
          💼 事业 / 财富 B
        </button>
        <button
          onClick={() => run("C")}
          className={`px-4 py-2 rounded-2xl border text-sm ${
            mode === "C" ? "bg-black text-white" : "bg-white"
          }`}
        >
          🧿 灵魂 / 创伤 C
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 text-red-700 text-sm p-4">
          ❌ {error}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl bg-blue-50 text-blue-700 text-sm p-4">
          🧠 AI 内容正在生成中，请稍候…
        </div>
      )}

      {text && (
        <article className="prose max-w-none">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 p-4 rounded-2xl">
            {text}
          </pre>
        </article>
      )}
    </section>
  );
}
