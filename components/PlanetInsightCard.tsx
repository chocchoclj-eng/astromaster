// components/PlanetInsightCard.tsx
import React from "react";
import { ReportCard } from "./ReportUIComponents";

const PLANET_ICONS: Record<string, string> = {
  Sun: "☀️", Moon: "🌙", Mercury: "☿️", Venus: "♀️", Mars: "♂️",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
  NorthNode: "☊", SouthNode: "☋", ASC: "⬆️", MC: "🏔️"
};

interface PlanetProps {
  body: string;
  sign: string;
  house: number;
  degree: number;
  meaning: string; // 对应您的科普逻辑
  personalizedInsight: string; // 对应您的画像逻辑
}

export default function PlanetInsightCard({ body, sign, house, degree, meaning, personalizedInsight }: PlanetProps) {
  const icon = PLANET_ICONS[body] || "🪐";
  
  return (
    <ReportCard className="group hover:border-white/20 transition-all duration-500">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-xl shadow-inner">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{body}｜{sign}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">House {house}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-mono text-xs text-blue-400/80 bg-blue-400/5 px-2 py-1 rounded-md border border-blue-400/10">
            {degree.toFixed(2)}°
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* 科普层：稳定定义的知识 */}
        <div className="rounded-2xl bg-white/[0.03] p-4 border border-white/5">
          <div className="mb-2 text-[10px] font-black uppercase text-white/30 flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-white/20"></span> 什么是{body}？
          </div>
          <p className="text-xs leading-relaxed text-white/60 font-medium">{meaning}</p>
        </div>
        
        {/* 画像层：落到用户本人的分析 */}
        <div className="rounded-2xl bg-blue-500/10 p-4 border border-blue-500/20">
          <div className="mb-2 text-[10px] font-black uppercase text-blue-400 flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-blue-400"></span> 你的{body}画像
          </div>
          <p className="text-sm font-semibold text-white/90">落点：{sign}座 第{house}宫。</p>
          <p className="mt-2 text-xs italic leading-relaxed text-blue-200/60">
            {personalizedInsight}
          </p>
        </div>
      </div>
    </ReportCard>
  );
}