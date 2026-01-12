"use client";

import React, { useMemo, useState } from "react";
import { MapPinned, X, Flame, HeartHandshake, Coins, MessageSquare, Users, Moon } from "lucide-react";
import type { Evidence } from "@/lib/career/careerEngine";

type ZoneId = "career" | "relationship" | "resources" | "expression" | "network" | "recovery";

const ZONES: Array<{
  id: ZoneId;
  title: string;
  subtitle: string;
  houses: number[];
  icon: React.ReactNode;
}> = [
  { id: "career", title: "事业场域", subtitle: "被看见 / 责任 / 名声", houses: [10], icon: <Flame className="text-indigo-300" /> },
  { id: "relationship", title: "关系场域", subtitle: "合作 / 边界 / 绑定", houses: [7, 8], icon: <HeartHandshake className="text-indigo-300" /> },
  { id: "resources", title: "资源场域", subtitle: "价值 / 定价 / 资产", houses: [2, 8], icon: <Coins className="text-indigo-300" /> },
  { id: "expression", title: "表达场域", subtitle: "学习 / 输出 / 影响", houses: [3, 5, 9], icon: <MessageSquare className="text-indigo-300" /> },
  { id: "network", title: "平台场域", subtitle: "社群 / 人脉 / 放大", houses: [11], icon: <Users className="text-indigo-300" /> },
  { id: "recovery", title: "恢复场域", subtitle: "独处 / 修复 / 潜意识", houses: [12, 4], icon: <Moon className="text-indigo-300" /> },
];

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-[36px] border border-white/10 bg-[#0A0B14] shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-white font-black tracking-tight">{title}</div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 inline-flex items-center gap-2"
          >
            <X size={14} /> 关闭
          </button>
        </div>
        <div className="p-6 max-h-[72vh] overflow-auto custom-scrollbar">{children}</div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.35); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}

export function TriggerMap({ evidence }: { evidence: Evidence[] }) {
  const [picked, setPicked] = useState<ZoneId | null>(null);

  const computed = useMemo(() => {
    const byHouse = new Map<number, number>();
    const byZone = new Map<ZoneId, { score: number; hits: Evidence[] }>();

    for (const z of ZONES) byZone.set(z.id, { score: 0, hits: [] });

    for (const e of evidence || []) {
      const h = Number(e.source?.house);
      if (!Number.isFinite(h)) continue;

      byHouse.set(h, (byHouse.get(h) || 0) + e.weight);

      for (const z of ZONES) {
        if (z.houses.includes(h)) {
          const item = byZone.get(z.id)!;
          item.score += e.weight;
          item.hits.push(e);
        }
      }
    }

    const max = Math.max(1, ...Array.from(byZone.values()).map((x) => x.score));

    const zones = ZONES.map((z) => {
      const item = byZone.get(z.id)!;
      const t = clamp01(item.score / max);
      const hits = item.hits
        .slice()
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3);

      return { ...z, score: item.score, t, hits };
    });

    return { zones, byHouse };
  }, [evidence]);

  const active = picked ? computed.zones.find((z) => z.id === picked) : null;

  return (
    <>
      <div className="rounded-[40px] border border-white/10 bg-black/30 p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black text-white/60 uppercase tracking-widest">
              TRIGGER MAP / 场景触发地图
            </div>
            <div className="mt-2 text-sm text-white/60">
              不评好坏，只显示「你的人生最常在哪些场域被点亮/被迫升级」——点击卡片看证据
            </div>
          </div>
          <div className="shrink-0 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
            <MapPinned size={14} /> Scene-Based
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {computed.zones.map((z) => {
            // 亮度表达强度（不是分数）
            const glow =
              z.t > 0.75
                ? "border-indigo-500/40 bg-indigo-500/12"
                : z.t > 0.45
                ? "border-white/12 bg-white/[0.05]"
                : "border-white/10 bg-white/[0.03]";

            return (
              <button
                key={z.id}
                onClick={() => setPicked(z.id)}
                className={[
                  "text-left rounded-[28px] border p-6 transition-all hover:bg-white/[0.06] group relative overflow-hidden",
                  glow,
                ].join(" ")}
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                        {z.title}
                      </div>
                      <div className="mt-1 text-sm text-white/55">{z.subtitle}</div>
                    </div>
                    <div className="shrink-0">{z.icon}</div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {z.houses.map((h) => (
                      <span
                        key={h}
                        className="px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white/70 font-mono"
                      >
                        H{h}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 text-xs text-white/45">
                    命中证据（Top）：
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-white/70">
                    {z.hits.slice(0, 2).map((e) => (
                      <div key={e.key} className="line-clamp-1">
                        • {e.text}
                      </div>
                    ))}
                    {z.hits.length === 0 ? <div className="text-white/35">—</div> : null}
                  </div>

                  <div className="mt-4 text-xs text-white/45">点击展开 →</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Modal
        open={!!picked}
        title={active ? `${active.title}（H${active.houses.join("/")}）` : ""}
        onClose={() => setPicked(null)}
      >
        {active ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
              <div className="text-xs font-black uppercase tracking-widest text-white/60">
                这个场域为什么亮？
              </div>
              <div className="mt-3 text-sm text-white/70">
                你在这些宫位（{active.houses.map((h) => `H${h}`).join(" / ")}）相关的场景更容易被触发，
                所以人生会反复出现“升级任务”。
              </div>
            </div>

            <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-6">
              <div className="text-xs font-black uppercase tracking-widest text-indigo-200">
                命中证据（Evidence）
              </div>
              <div className="mt-4 space-y-3">
                {active.hits
                  .slice()
                  .sort((a, b) => b.weight - a.weight)
                  .map((e) => (
                    <div key={e.key} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <div className="text-xs font-mono text-white/40">{e.key}</div>
                      <div className="mt-2 text-white/80">{e.text}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {e.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white/70 font-mono"
                          >
                            {t}
                          </span>
                        ))}
                        <span className="px-2.5 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xs text-indigo-200 font-mono">
                          w={e.weight}
                        </span>
                        <span className="px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 font-mono">
                          {e.source.body} · {e.source.sign} · H{e.source.house}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}