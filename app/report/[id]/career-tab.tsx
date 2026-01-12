// app/report/[id]/career-tab.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { inferCareerDomainsFromPlacements } from "@/lib/career/domainEngine";
import { ROLE_LIBRARY } from "@/lib/rolelibrary";
import { inferRolesFromExplain, type ExplainItem } from "@/lib/roleEngine";
import type { CareerDevelopmentOutput, Placement, CareerDebugTrace } from "@/lib/career/careerEngine";
import { LifeOSPanel } from "./lifeos-panel";
import {
  Target,
  Compass,
  TrendingUp,
  ShieldAlert,
  Cpu,
  Award,
  ArrowUpRight,
  CheckCircle2,
  Telescope,
  Bug,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function CareerTab({
  items,
  careerDev,
  careerTrace,
}: {
  items: ExplainItem[];
  careerDev: CareerDevelopmentOutput;
  careerTrace?: CareerDebugTrace;
}) {
  const sp = useSearchParams();
  const debug = sp.get("debug") === "1";

  const [debugOpen, setDebugOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!items || items.length === 0) return null;
    return inferRolesFromExplain(items);
  }, [items]);

  // ✅ 你原来就想用 domainEngine：这里把 ExplainItem[] 转成 Placement[] 做 domainResult
  const domainResult = useMemo(() => {
    if (!items || items.length === 0) return null;

    const placements: Placement[] = items.map((it) => ({
      body: it.body as any,
      sign: it.sign as any,
      house: Number(it.house),
      degree: (it as any).degree, // 如果 ExplainItem 没 degree，这行也不会影响（undefined）
    }));

    try {
      return inferCareerDomainsFromPlacements(placements);
    } catch (e) {
      console.warn("inferCareerDomainsFromPlacements failed:", e);
      return null;
    }
  }, [items]);

  if (!result) {
    return (
      <div className="py-20 text-center text-white/40 font-mono tracking-widest animate-pulse">
        [ SYSTEM_DECODING_ROLE_IDENTITY... ]
      </div>
    );
  }

  const primary = ROLE_LIBRARY[result.primaryRole];
  const secondary = result.secondaryRoles.map((id) => ROLE_LIBRARY[id]);
  const primaryReasons = result.reasons.find((r) => r.role === result.primaryRole)?.hits || [];

  async function copyDebug() {
    if (!careerTrace) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify({ careerTrace, domainResult }, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.warn("copy failed:", e);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-24 text-slate-200">
      {/* --- Section 1: 主身份块（不动） --- */}
      <section className="relative overflow-hidden rounded-[48px] border border-indigo-500/30 bg-[#0A0B14] p-10 md:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none">
          <Award size={200} className="text-indigo-500" />
        </div>
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-24 w-24 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)]">
              <Target size={48} className="text-white" />
            </div>
            <div>
              <h2 className="text-5xl font-black tracking-tight text-white mb-2 uppercase">
                {primary.nameZh}
              </h2>
              <p className="text-indigo-400 font-mono tracking-widest text-sm uppercase">
                Primary Identity: {primary.nameEn}
              </p>
            </div>
          </div>
          <div className="max-w-3xl border-l-4 border-indigo-500 pl-8 py-2">
            <p className="text-2xl font-medium italic leading-relaxed text-slate-100">
              “{primary.summary}”
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/40 rounded-3xl p-8 border border-slate-700/50">
              <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-400 mb-6 uppercase tracking-wider">
                <Cpu size={16} /> 判定逻辑 (Chart Reasons)
              </h3>
              <ul className="space-y-4">
                {primaryReasons.map((hit, i) => (
                  <li key={i} className="flex items-start gap-3 text-[15px] text-slate-300">
                    <CheckCircle2 size={16} className="text-indigo-500 mt-1 shrink-0" />
                    {hit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-indigo-900/10 rounded-3xl p-8 border border-indigo-500/20">
              <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-400 mb-6 uppercase tracking-wider">
                <Compass size={16} /> 黄金对齐路径
              </h3>
              <div className="space-y-4">
                {primary.recommendedCareers.map((job, i) => (
                  <div key={i} className="group cursor-default">
                    <div className="text-white font-bold text-lg group-hover:text-indigo-400 transition-colors">
                      {job.title}
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mt-1">
                      {job.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: 投资与增长（不动） --- */}
      <section className="space-y-8">
        <div className="px-6 flex items-center gap-4">
          <TrendingUp className="text-emerald-500" />
          <h3 className="text-xl font-bold tracking-widest uppercase text-slate-400">
            Investment Logic / 财富增长逻辑
          </h3>
        </div>
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-8 rounded-[40px] bg-gradient-to-br from-slate-900 to-black border border-slate-800 p-12">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">Investment Style</label>
                  <p className="text-2xl font-bold text-white mt-1">{primary.investment.style}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">Strategic Path</label>
                  <p className="text-lg text-slate-300 leading-relaxed mt-2">{primary.investment.strategy}</p>
                </div>
                <div className="pt-4 flex flex-wrap gap-3">
                  {primary.tags?.map((t) => (
                    <span key={t} className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 rounded-[40px] bg-red-950/20 border border-red-500/30 p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert size={20} />
                <span className="font-bold uppercase tracking-widest text-xs">Risk Defense</span>
              </div>
              <p className="text-lg font-medium text-red-100/80 italic leading-relaxed">
                “{primary.investment.risk}”
              </p>
            </div>
            <div className="text-[10px] text-red-500/50 font-mono mt-8">
              SYSTEM_WARNING: ASSET_VULNERABILITY_DETECTED
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 3: 多维潜能（不动） --- */}
      <section className="space-y-8">
        <div className="px-6 flex items-center gap-4 text-slate-400">
          <Cpu />
          <h3 className="text-xl font-bold tracking-widest uppercase">
            Sub-Paths / 多维职业潜能开发
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {secondary.map((role, idx) => (
            <div key={role.id} className="group relative rounded-[40px] border border-white/5 bg-white/[0.02] p-10 hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-500">
              <div className="absolute top-8 right-10 text-indigo-500/20 group-hover:text-indigo-500/50 transition-colors">
                <ArrowUpRight size={40} />
              </div>
              <div className="space-y-6">
                <div className="inline-block px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-tighter">
                  Path 0{idx + 2}
                </div>
                <h4 className="text-3xl font-bold text-white group-hover:translate-x-1 transition-transform">
                  {role.nameZh}
                </h4>
                <p className="text-slate-400 leading-relaxed text-[15px]">
                  {role.summary}
                </p>
                <div className="pt-4 border-t border-white/5 space-y-3">
                  {role.recommendedCareers.slice(0, 1).map((c, i) => (
                    <div key={i} className="text-sm">
                      <span className="text-indigo-400 font-bold">建议切入点：</span>
                      <span className="text-slate-300">{c.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ 可选：职业大类（你已有 domainEngine） */}
      {domainResult?.topDomains?.length ? (
        <section className="space-y-8">
          <div className="px-6 flex items-center gap-4 text-slate-400">
            <Telescope className="text-indigo-400" />
            <h3 className="text-xl font-bold tracking-widest uppercase">
              Career Domains / 职业大类与学科方向
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {domainResult.topDomains.map((d: any) => (
              <div
                key={d.domain}
                className="rounded-[40px] border border-white/5 bg-white/[0.02] p-10 hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-500"
              >
                <div className="text-xs font-mono text-white/40 uppercase tracking-widest">
                  DOMAIN
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {String(d.domain)}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    细分方向（Top Tracks）
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(d.tracks || []).slice(0, 3).map((tr: any) => (
                      <span
                        key={tr.name}
                        className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold"
                      >
                        {tr.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    命中依据（Top Reasons）
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {(d.reasons || []).slice(0, 3).map((r: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-2 h-1 w-1 rounded-full bg-indigo-500 shrink-0" />
                        <span className="text-white/70">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ✅ 原 Section 4：人生操作系统（不动） */}
      <section className="space-y-8">
        <div className="px-6 flex items-center gap-4 text-slate-400">
          <Cpu className="text-indigo-400" />
          <h3 className="text-xl font-bold tracking-widest uppercase">
            LifeOS / 人生操作系统（职业决策仪表盘）
          </h3>
        </div>
        <LifeOSPanel careerDev={careerDev} />
      </section>

      {/* ✅ DEBUG：只在 ?debug=1 时显示 */}
      {debug && careerTrace ? (
        <section className="space-y-4">
          <div className="px-6 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <Bug className="text-indigo-400" size={18} />
              <h3 className="text-xl font-bold tracking-widest uppercase">
                Debug / 职业计算追踪
              </h3>
              <span className="text-xs font-mono text-white/30">?debug=1</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDebugOpen((v) => !v)}
                className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 text-xs font-bold flex items-center gap-2"
              >
                {debugOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {debugOpen ? "收起" : "展开"}
              </button>

              <button
                onClick={copyDebug}
                className="px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/15 text-xs font-bold flex items-center gap-2"
              >
                <Copy size={14} />
                {copied ? "已复制" : "复制JSON"}
              </button>
            </div>
          </div>

          {debugOpen ? (
            <div className="rounded-[24px] border border-white/10 bg-black/40 p-6">
              <div className="text-xs font-mono text-white/40 mb-3">
                包含：inputs(placements) / evidence / tagScores / roleScores / buckets / pitfalls / domainResult
              </div>
              <pre className="text-xs text-white/70 overflow-auto max-h-[620px] whitespace-pre-wrap break-words">
                {JSON.stringify({ careerTrace, domainResult }, null, 2)}
              </pre>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}