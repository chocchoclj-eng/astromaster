// app/report/[id]/score-panel.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { SPECTRUM_20, type Spectrum20Id } from "@/lib/scoring/spectrum20.mapping";

// --- 基础类型定义 ---
type Props = {
  score: any; // computeScore(...) 返回的完整对象
  chartMeta?: {
    name?: string;
    sun?: string;
    moon?: string;
    asc?: string;
  };
  title?: string;
};

type AIBlock = {
  title: string;
  scoreMeaning: string;
  sections: { key: string; title: string; text: string }[];
  evidenceUsed?: string[];
  percentile?: number; // 核心：人群排位百分比
};

type AIState =
  | { status: "idle" }
  | { status: "queued" }
  | { status: "loading"; startedAt: number }
  | { status: "ok"; data: AIBlock }
  | { status: "error"; error: string };

type ExplainType = "domain" | "trait" | "nsv" | "overview";

// --- 语义常量定义 ---
const DOMAIN_ZH: Record<string, string> = {
  Love: "爱情机制",
  Career: "事业驱动",
  Investment: "投资策略",
  Friendship: "社交边界",
  Family: "亲缘能量",
  Resilience: "受挫复原"
};

const DOMAIN_ORDER = ["Love", "Career", "Investment", "Friendship", "Family", "Resilience"];

// --- 视觉子组件：稀有度勋章 ---
function RareIndexBadge({ percentile }: { percentile?: number }) {
  if (percentile === undefined) return null;
  // 计算 Top 百分比：如果 percentile 是 95，代表排在前 5%
  const displayTop = percentile > 50 ? 100 - percentile : percentile;
  const isExtreme = displayTop <= 15;
  
  return (
    <div className="flex flex-col items-end shrink-0">
      <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Rare Index</span>
      <div className={clsx(
        "text-sm font-black italic tracking-tighter",
        isExtreme ? "text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]" : "text-indigo-400"
      )}>
        TOP {displayTop.toFixed(1)}%
      </div>
      <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
        {isExtreme ? "风格鲜明" : "典型分布"}
      </div>
    </div>
  );
}

// --- 视觉子组件：双向能量频谱条 ---
function BipolarBar({ value, leftLabel, rightLabel }: { value: number, leftLabel: string, rightLabel: string }) {
  const tilt = value - 50; 
  const isRight = tilt > 0;
  const absTilt = Math.abs(tilt);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end px-1">
        <div className={clsx("text-[10px] tracking-widest transition-all", !isRight ? "text-cyan-400 font-bold" : "text-white/20")}>
          {leftLabel}
        </div>
        <div className={clsx("text-[10px] tracking-widest transition-all", isRight ? "text-fuchsia-400 font-bold" : "text-white/20")}>
          {rightLabel}
        </div>
      </div>

      <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
        <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white/20 z-10" />
        <div 
          className={clsx(
            "absolute h-full transition-all duration-[1500ms] ease-out",
            isRight ? "left-1/2 bg-fuchsia-600 shadow-[0_0_12px_fuchsia]" 
                    : "right-1/2 bg-cyan-600 shadow-[0_0_12px_cyan]"
          )}
          style={{ width: `${(absTilt / 50) * 50}%` }}
        />
      </div>
    </div>
  );
}

// --- 统一解析内容容器 ---
function AIBlockView({ state, score, subtype }: { state: AIState, score?: number, subtype?: string }) {
  if (!state || state.status === "idle" || state.status === "queued") return <LoadingSkeleton text="正在排队解析任务..." />;
  if (state.status === "loading") return <LoadingSkeleton text="正在基于星盘多维论证..." />;

  if (state.status === "error") {
    return (
      <div className="rounded-[32px] border border-rose-500/20 bg-rose-500/5 p-8 text-rose-200">
        <p className="text-xs font-mono uppercase opacity-50 mb-2">Error_Generation</p>
        <p className="text-sm">{state.error}</p>
      </div>
    );
  }

  const d = state.data;
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="space-y-2">
        <h3 className="font-serif text-2xl text-white/90">{d.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed italic opacity-80">{d.scoreMeaning}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 border-t border-white/5 pt-8">
        {d.sections.map((s: any) => (
          <div key={s.key} className="space-y-3">
            <h4 className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest flex items-center gap-2">
               <span className="w-1 h-3 bg-indigo-500/30 rounded-full" /> {s.title}
            </h4>
            <p className="text-[14px] leading-7 text-slate-300 text-justify whitespace-pre-line">
              {s.text.replace(/\*\*/g, '')}
            </p>
          </div>
        ))}
      </div>

      {d.evidenceUsed?.length ? (
        <div className="border-t border-white/5 bg-black/20 px-8 py-3 flex flex-wrap items-center gap-3 text-[9px] text-white/20">
          <span className="font-mono uppercase tracking-widest opacity-40">Evidence Trace:</span>
          {d.evidenceUsed.map((ev, i) => (
            <span key={i} className="bg-white/5 px-2 py-0.5 rounded border border-white/5">{ev}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LoadingSkeleton({ text }: { text: string }) {
  return (
    <div className="rounded-[40px] border border-white/5 bg-white/[0.01] p-10 animate-pulse">
      <div className="flex items-center gap-3 mb-8">
        <div className="animate-spin rounded-full border-2 border-indigo-400 border-t-transparent w-3 h-3" />
        <span className="text-[10px] font-mono text-indigo-300/40 uppercase tracking-widest">{text}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-3"><div className="h-3 w-full bg-white/5 rounded"/><div className="h-3 w-4/5 bg-white/5 rounded"/></div>
        <div className="space-y-3"><div className="h-3 w-full bg-white/5 rounded"/><div className="h-3 w-4/5 bg-white/5 rounded"/></div>
      </div>
    </div>
  );
}

// --- 主面板组件 ---
export function ScorePanel({ score, chartMeta, title = "星盘动力学评估" }: Props) {
  const { domains, traits, nsv, evidence } = score || {};
  const [aiMap, setAiMap] = useState<Record<string, AIState>>({});
  const aiMapRef = useRef<Record<string, AIState>>({});
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [openNSV, setOpenNSV] = useState(false);

  // --- 并发调度引擎 (完整长度保留) ---
  const queueRef = useRef<{ running: number; tasks: { id: string; run: () => Promise<void> }[] }>({ running: 0, tasks: [] });
  const CONCURRENCY = 2;
  const MIN_LOADING_MS = 3500;

  const setAI = (id: string, next: AIState) => {
    aiMapRef.current[id] = next;
    setAiMap({ ...aiMapRef.current });
  };
  const getAI = (id: string) => aiMapRef.current[id] || { status: "idle" };

  const pumpQueue = () => {
    const q = queueRef.current;
    while (q.running < CONCURRENCY && q.tasks.length > 0) {
      const t = q.tasks.shift()!;
      q.running++;
      t.run().finally(() => { q.running--; pumpQueue(); });
    }
  };

  const requestAI = (type: ExplainType, key: string, payload: any) => {
    const id = `${type}:${key}`;
    if (getAI(id).status === "ok" || getAI(id).status === "loading") return;

    setAI(id, { status: "queued" });
    queueRef.current.tasks.push({
      id,
      run: async () => {
        const start = Date.now();
        setAI(id, { status: "loading", startedAt: start });
        try {
          const res = await fetch("/api/ai/score-explain", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kind: type, payload })
          });
          const j = await res.json();
          if (!j.ok) throw new Error(j.error);
          
          const elapsed = Date.now() - start;
          if (elapsed < MIN_LOADING_MS) await new Promise(r => setTimeout(r, MIN_LOADING_MS - elapsed));
          setAI(id, { status: "ok", data: j.content });
        } catch (e: any) { setAI(id, { status: "error", error: e.message }); }
      }
    });
    pumpQueue();
  };

  // --- 20条频谱动态计算 ---
  const spectrumRows = useMemo(() => {
    if (!traits) return [];
    const t = (k: string) => Number(traits[k] ?? 50);
    return SPECTRUM_20.map(s => {
      const leftIdx = Object.entries(s.leftIndexFormula.weights).reduce((acc, [k, w]) => acc + t(k) * (w as number), 0);
      const rightIdx = Object.entries(s.rightIndexFormula.weights).reduce((acc, [k, w]) => acc + t(k) * (w as number), 0);
      return { 
        ...s, 
        value: Math.max(0, Math.min(100, (rightIdx - leftIdx + 100) / 2)) 
      };
    });
  }, [traits]);

  // --- 预加载驱动逻辑 ---
  useEffect(() => {
    if (!score) return;

    // 1. 加载总览
    requestAI("overview", "overview", { domains, traits, nsv });

    // 2. 加载场域多维解析 (不再单独显示分数)
    DOMAIN_ORDER.forEach(d => {
      requestAI("domain", d, { 
        key: d, score: domains[d], 
        domainEvidence: evidence?.domains?.[d], 
        chartMeta 
      });
    });

    // 3. 加载 20 条频谱图谱
    spectrumRows.forEach(s => {
      requestAI("trait", `spectrum:${s.id}`, { 
        subtype: "spectrum", key: s.id, title: s.title, value: s.value, 
        leftLabel: s.leftLabel, rightLabel: s.rightLabel, 
        evidence: { traitsUsed: Object.keys(s.leftIndexFormula.weights).map(k => [k, traits[k]]) },
        chartMeta 
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, spectrumRows]);

  return (
    <div className="max-w-6xl mx-auto space-y-24 py-20 px-6 font-sans text-slate-200">
      
      {/* Header */}
      <header className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-px w-16 bg-indigo-500/50" />
          <span className="text-[10px] font-bold tracking-[0.5em] text-indigo-400 font-mono uppercase opacity-70">Engine_Persona_V1.4</span>
        </div>
        <h1 className="font-serif text-6xl md:text-8xl font-bold text-white leading-tight tracking-tight">{title}</h1>
        <p className="text-slate-400 max-w-2xl text-lg leading-relaxed font-light">
          摒弃单纯的分数评判，基于<span className="text-white font-normal underline decoration-indigo-500/50 underline-offset-4">常模样本对比</span>与双向能量公式，深度解析你生命场域的本能路径与独特性。
        </p>
      </header>

      {/* 第一部分：生命核心场域 (多维路径解析版) */}
      <section className="space-y-12">
        <h2 className="text-2xl font-bold px-2 flex items-center gap-4">
           <span className="w-1.5 h-8 bg-indigo-500 rounded-full shadow-[0_0_15px_indigo]" />
           生命场域多维路径分析
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {DOMAIN_ORDER.map(k => {
            const id = `domain:${k}`;
            const state = getAI(id);
            const isOpen = openSection === id;
            return (
              <div key={k} className={clsx(
                "group rounded-[48px] border border-white/5 bg-white/[0.01] transition-all duration-700",
                isOpen ? "md:col-span-2 border-indigo-500/30 bg-slate-900/40 shadow-2xl" : "hover:bg-white/[0.03]"
              )}>
                <button onClick={() => setOpenSection(isOpen ? null : id)} className="w-full p-10 flex justify-between items-center text-left">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-slate-200">{DOMAIN_ZH[k]}</div>
                    <div className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-mono">Dynamic_Pathway</div>
                  </div>
                  <RareIndexBadge percentile={state.status === 'ok' ? state.data.percentile : undefined} />
                </button>
                {isOpen && (
                  <div className="px-10 pb-12 pt-0 animate-in slide-in-from-top-4 duration-500">
                    <AIBlockView state={state} subtype="domain" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 第二部分：20条性格动力频谱看板 (完全展示所有维度) */}
      <section className="space-y-16">
        <div className="px-2">
           <h2 className="text-2xl font-bold text-white uppercase tracking-widest flex items-center gap-4">
              <span className="w-1.5 h-8 bg-fuchsia-500 rounded-full shadow-[0_0_15px_fuchsia]" />
              🧭 20 条性格动力倾斜频谱
           </h2>
           <p className="text-sm text-white/30 mt-3 font-serif italic">左 ↔ 右代表本能行为的中点偏移程度，0 代表极致平衡。</p>
        </div>
        <div className="grid gap-6">
          {spectrumRows.map(s => {
            const id = `trait:spectrum:${s.id}`;
            const isOpen = openSection === id;
            const state = getAI(id);
            return (
              <div key={s.id} className={clsx(
                "rounded-[40px] border transition-all duration-700",
                isOpen ? "border-indigo-500/40 bg-slate-900/60 shadow-2xl" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
              )}>
                <button 
                  onClick={() => setOpenSection(isOpen ? null : id)}
                  className="w-full p-10 flex flex-col md:flex-row justify-between items-center gap-12 text-left"
                >
                  <div className="flex-1 space-y-2">
                     <h3 className="text-xl font-bold text-slate-100">{s.title}</h3>
                     <p className="text-xs text-white/30 leading-relaxed max-w-md">{s.desc}</p>
                  </div>
                  <div className="w-full md:w-[500px]">
                    <BipolarBar value={s.value} leftLabel={s.leftLabel} rightLabel={s.rightLabel} />
                  </div>
                  <RareIndexBadge percentile={state.status === 'ok' ? state.data.percentile : undefined} />
                </button>
                {isOpen && (
                  <div className="px-10 pb-12 pt-0 animate-in slide-in-from-top-4 duration-500 border-t border-white/5 mt-4 pt-12">
                     <AIBlockView state={state} score={s.value} subtype="spectrum" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 第三部分：NSV 压力脚本 */}
      <section className="space-y-10">
        <button 
          onClick={() => setOpenNSV(!openNSV)}
          className="w-full flex items-center justify-between px-2 group"
        >
          <h2 className="text-xl font-bold group-hover:text-indigo-400 transition tracking-widest">🧭 压力反应与进化轨迹 (NSV)</h2>
          <span className="text-white/20 text-xs font-mono">{openNSV ? "CLOSE_PROTOCOL" : "OPEN_PROTOCOL"}</span>
        </button>
        {openNSV && (
          <div className="animate-in fade-in zoom-in-95 duration-700">
             <AIBlockView state={getAI("nsv:nsv")} />
          </div>
        )}
      </section>

      {/* Footer / Meta Trace */}
      <footer className="pt-20 pb-10 border-t border-white/5 flex flex-col items-center gap-6 opacity-30">
        <div className="flex gap-8 font-mono text-[9px] uppercase tracking-[0.5em]">
          <span>Engine_Release: v1.4.5</span>
          <span>Sample_Size: 100,000_Synthetic</span>
          <span>Complexity: {evidence?.aspects?.length || 0}_Aspects</span>
        </div>
        <p className="text-[8px] uppercase tracking-[1em] text-center">Neural Architecture by ACIM Systems</p>
      </footer>
    </div>
  );
}