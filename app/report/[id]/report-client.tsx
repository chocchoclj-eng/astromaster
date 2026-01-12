// app/report/[id]/report-client.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, ErrorBox, Pill } from "./report-ui";
import { explainPlacementImpact, planetMeaning, zhBody, fmtDeg } from "@/lib/astroExplain";
import { CareerTab } from "./career-tab";
import { Loader2, Briefcase, Sparkles, Fingerprint, Terminal } from "lucide-react";

// ✅ 你已有：normalizePlacements + buildExplainItems
import { normalizePlacements, buildExplainItems } from "@/lib/career";

// ✅ NEW：带 trace 的职业计算（用于 debug）
import {
  computeCareerDevelopmentWithTrace,
  type CareerDebugTrace,
} from "@/lib/career/careerEngine";

type Props = { id: string };
type Mode = "career" | "base";

/** ✅ 修复报错：安全提取文字内容 */
function pickImpactText(x: any): string {
  if (typeof x === "string") return x;
  if (x && typeof x === "object") return x.text || x.oneLine || "";
  return "";
}

export function ReportClient({ id }: Props) {
  const [loadingChart, setLoadingChart] = useState(true);
  const [keyConfig, setKeyConfig] = useState<any>(null);
  const [chartError, setChartError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Mode>("base");

  // ✅【职业数据流】把后端 planets 规范化成 placements（body/sign/house）
  const placements = useMemo(() => {
    const rawPlanets = keyConfig?.coreFull?.planets || keyConfig?.planets || [];
    try {
      return normalizePlacements(rawPlanets);
    } catch (e) {
      console.warn("normalizePlacements failed:", e);
      return [];
    }
  }, [keyConfig]);

  // ✅【CareerTab 需要的 items】ExplainItem[]
  const explainItems = useMemo(() => {
    const items = buildExplainItems(placements);
    console.log("🚀 [Career] ExplainItems:", items);
    return items;
  }, [placements]);

  // ✅ NEW：【职业发展 + debug trace】一套算出来
  const careerPack = useMemo(() => {
    const pack = computeCareerDevelopmentWithTrace(placements);
    console.log("🚀 [Career] CareerDev:", pack.output);
    console.log("🧪 [Career] CareerTrace:", pack.trace);
    return pack;
  }, [placements]);

  const careerDev = careerPack.output;
  const careerTrace: CareerDebugTrace = careerPack.trace;

  useEffect(() => {
    (async () => {
      try {
        setLoadingChart(true);
        const r = await fetch(`/api/chart?id=${encodeURIComponent(id)}`, { cache: "no-store" });
        const j = await r.json();
        setKeyConfig(j?.keyConfig ?? j);
      } catch (e: any) {
        setChartError("加载星盘数据失败");
      } finally {
        setLoadingChart(false);
      }
    })();
  }, [id]);

  const headerInfo = useMemo(() => {
    const i = keyConfig?.input || {};
    const c = keyConfig?.core || {};
    return {
      name: i?.name || "未命名",
      city: i?.city || "未知地点",
      date: (i?.birthDateTime || "").split("T")[0] || "—",
      time: (i?.birthDateTime || "").split("T")[1]?.slice(0, 5) || "—",
      sun: c.sun ? `${c.sun.sign} · ${c.sun.house}宫` : "—",
      moon: c.moon ? `${c.moon.sign} · ${c.moon.house}宫` : "—",
      asc: c.asc ? `${c.asc.sign} · ${c.asc.house}宫` : "—",
    };
  }, [keyConfig]);

  const overview = useMemo(() => {
    if (keyConfig?.overview?.oneSentence) return keyConfig.overview.oneSentence;
    return `你是一个${headerInfo.sun}、${headerInfo.moon}，且带有${headerInfo.asc}面具的独特灵魂。`;
  }, [keyConfig, headerInfo]);

  const planetList = useMemo(() => {
    const planets: any[] = keyConfig?.coreFull?.planets || [];
    const map = new Map<string, any>();
    planets.forEach((p) => map.set(p.body, p));
    const order = [
      "Sun",
      "Moon",
      "Mercury",
      "Venus",
      "Mars",
      "Jupiter",
      "Saturn",
      "Uranus",
      "Neptune",
      "Pluto",
      "NorthNode",
      "SouthNode",
      "ASC",
      "MC",
    ];
    return order
      .map((k) => {
        const p = map.get(k);
        return p ? { key: k, display: zhBody(k), p } : null;
      })
      .filter(Boolean) as any[];
  }, [keyConfig]);

  if (loadingChart)
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#050505] text-white">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
        <p className="text-sm font-black tracking-[0.4em] text-white/40 uppercase font-data">
          System Decoding...
        </p>
      </div>
    );

  if (chartError) {
    return (
      <div className="min-h-screen bg-[#050505] text-neutral-50 flex items-center justify-center px-6">
        <div className="max-w-xl w-full">
          <ErrorBox>
            <div className="text-lg font-bold mb-2">加载失败</div>
            <div>{chartError}</div>
          </ErrorBox>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-50 pb-24 font-body selection:bg-indigo-500/30">
      <div className="pointer-events-none fixed inset-0 opacity-20 [background:radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.25),transparent_70%)]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-12 space-y-12">
        {/* 1. 基础信息聚合区 */}
        <section className="space-y-6 animate-in fade-in duration-700">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 bg-white/[0.02] border border-white/5 p-10 rounded-[40px] backdrop-blur-md relative overflow-hidden">
            <div className="space-y-5 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest font-data">
                <Fingerprint size={12} /> Registry / 灵魂登记
              </div>
              <h1 className="text-6xl font-black tracking-tighter text-white font-heading">
                {headerInfo.name}
              </h1>
              <div className="flex flex-wrap gap-3 font-body">
                <Pill>📍 {headerInfo.city}</Pill>
                <Pill>📅 {headerInfo.date}</Pill>
                <Pill>⏰ {headerInfo.time}</Pill>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 text-[11px] font-bold min-w-[240px] font-data relative z-10">
              <div className="flex justify-between p-3 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-white/20 uppercase">Core_Sun</span>{" "}
                <span className="text-indigo-400">{headerInfo.sun}</span>
              </div>
              <div className="flex justify-between p-3 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-white/20 uppercase">Core_Moon</span>{" "}
                <span className="text-indigo-400">{headerInfo.moon}</span>
              </div>
              <div className="flex justify-between p-3 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-white/20 uppercase">Core_ASC</span>{" "}
                <span className="text-indigo-400">{headerInfo.asc}</span>
              </div>
            </div>
          </div>

          {/* 独立画像总结框 */}
          <div className="group relative p-12 rounded-[48px] bg-indigo-600/5 border border-indigo-500/20 shadow-[0_0_100px_-20px_rgba(99,102,241,0.2)] overflow-hidden transition-all">
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6 font-data opacity-70">
              Analysis_Summary / 画像总结
            </div>
            <p className="text-3xl font-medium leading-tight italic text-white tracking-tight font-archive">
              “ {overview} ”
            </p>
            <div className="absolute -right-6 -bottom-6 text-9xl font-black text-white/[0.02] pointer-events-none italic select-none font-heading uppercase">
              SOUL
            </div>
          </div>
        </section>

        {/* 2. 主导航切换按钮 */}
        <nav className="flex justify-center gap-8 py-6 relative z-10">
          <button
            onClick={() => setActiveTab("base")}
            className={`flex items-center gap-3 px-12 py-5 rounded-[24px] font-bold transition-all duration-500 font-heading tracking-tight ${
              activeTab === "base"
                ? "bg-white text-black scale-105 shadow-2xl"
                : "bg-white/5 text-white/30 hover:bg-white/10"
            }`}
          >
            <Sparkles size={20} /> 基础星盘科普
          </button>
          <button
            onClick={() => setActiveTab("career")}
            className={`flex items-center gap-3 px-12 py-5 rounded-[24px] font-bold transition-all duration-500 font-heading tracking-tight ${
              activeTab === "career"
                ? "bg-indigo-600 text-white scale-105 shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)]"
                : "bg-white/5 text-white/30 hover:bg-white/10"
            }`}
          >
            <Briefcase size={20} /> 职业配置 / 灵魂身份
          </button>
        </nav>

        {/* 3. 内容分流展示区 */}
        <div className="mt-8">
          {activeTab === "career" ? (
            <div className="animate-in fade-in slide-in-from-right-10 duration-1000">
              {/* careerTrace（用于 debug）仅在需要时传递 */}
              <CareerTab items={explainItems as any} careerDev={careerDev} careerTrace={careerTrace} />
            </div>
          ) : (
            <div className="space-y-24 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              {planetList.map(({ key, display, p }) => {
                const impactRaw = explainPlacementImpact({
                  body: key,
                  sign: p.sign,
                  house: Number(p.house),
                  degree: Number(p.degree),
                });
                const impactText = pickImpactText(impactRaw);

                return (
                  <div key={key} className="group relative">
                    <div className="flex flex-col md:flex-row md:items-end gap-4 mb-10 px-6 border-l-8 border-indigo-600 pl-8 transition-all group-hover:border-indigo-400">
                      <h3 className="text-5xl font-black tracking-tighter text-white font-heading leading-none">
                        {display}{" "}
                        <span className="text-indigo-500/20 font-thin mx-2">/</span>{" "}
                        {p.sign}{" "}
                        <span className="text-indigo-500/20 font-thin mx-2">/</span>{" "}
                        第{p.house}宫
                      </h3>
                      <span className="font-data text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-widest mb-1">
                        SYST_ID: {key} // {fmtDeg(p.degree)}
                      </span>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                      <div className="lg:col-span-4 rounded-[36px] border border-white/5 bg-white/[0.02] p-10 backdrop-blur-md group-hover:bg-white/[0.04] transition-colors flex flex-col justify-center border-t-white/10 shadow-2xl">
                        <div className="text-[10px] font-data uppercase text-indigo-400/50 tracking-[0.3em] mb-6 flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" />{" "}
                          Functional_Logic
                        </div>
                        <p className="text-[20px] leading-relaxed text-white/80 font-archive italic tracking-wide">
                          “{planetMeaning(key)}”
                        </p>
                      </div>

                      <div className="lg:col-span-8 rounded-[48px] border border-white/10 bg-[#08080A] p-10 md:p-14 relative overflow-hidden group-hover:border-indigo-500/30 transition-all shadow-2xl ring-1 ring-white/5">
                        <div className="relative z-10">
                          <div className="text-[11px] font-data uppercase text-indigo-400 tracking-[0.4em] mb-10 flex items-center gap-3">
                            <Terminal size={14} className="text-indigo-500" />{" "}
                            Soul_Architecture_Deep_Dive
                          </div>

                          <div className="max-h-[600px] overflow-y-auto pr-8 custom-scrollbar">
                            <div className="space-y-10">
                              {impactText.split("\n").map((line, i) => {
                                if (!line.trim()) return <div key={i} className="h-4" />;

                                if (
                                  line.includes("【") ||
                                  line.includes("🧾") ||
                                  line.includes("♈") ||
                                  line.includes("🏠") ||
                                  line.includes("🧠")
                                ) {
                                  return (
                                    <h4
                                      key={i}
                                      className="text-2xl font-black text-white mt-12 mb-6 font-heading flex items-center gap-3 tracking-tight border-b border-white/5 pb-4 first:mt-0"
                                    >
                                      <span className="w-1.5 h-6 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]" />
                                      {line
                                        .replace(/【|】|📍|🧾|♈|🏠|🧠/g, "")
                                        .trim()}
                                    </h4>
                                  );
                                }

                                if (/^\d+/.test(line.trim())) {
                                  return (
                                    <div key={i} className="flex gap-6 py-2 group/line">
                                      <span className="font-data text-4xl text-indigo-500/40 font-black group-hover/line:text-indigo-400 transition-colors shrink-0">
                                        {line.trim().charAt(0).padStart(2, "0")}
                                      </span>
                                      <p className="text-[19px] leading-[1.8] text-white font-body font-medium tracking-tight pt-1">
                                        {line.replace(/^\d+/, "").trim()}
                                      </p>
                                    </div>
                                  );
                                }

                                return (
                                  <p
                                    key={i}
                                    className="text-[19px] leading-[2.1] text-white/70 font-body font-light tracking-normal border-l-2 border-white/5 pl-8 ml-1 transition-colors group-hover:text-white/90"
                                  >
                                    {line}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="absolute top-0 right-0 p-12 text-[12rem] font-black text-white/[0.015] pointer-events-none italic uppercase select-none font-heading leading-none">
                          {key.slice(0, 2)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@900&family=Plus+Jakarta+Sans:wght@300;500;700&family=EB+Garamond:italic,wght@1,500&family=Fira+Code:wght@500;700&display=swap');
        
        .font-heading { font-family: 'Outfit', sans-serif; }
        .font-body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-archive { font-family: 'EB Garamond', serif; }
        .font-data { font-family: 'Fira Code', monospace; }

        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: linear-gradient(to bottom, #6366f1, transparent); 
          border-radius: 10px; 
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #818cf8; }
        
        p, div, h1, h3, h4 { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
      `}</style>
    </div>
  );
} 