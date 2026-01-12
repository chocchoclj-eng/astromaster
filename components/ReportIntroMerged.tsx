"use client";

import React, { useMemo } from "react";

type Planet = { body: string; sign: string; house: number; degree?: number };
type KeyConfig = {
  core?: { sun?: Planet; moon?: Planet; asc?: Planet; mc?: Planet; saturn?: Planet };
  nodes?: { north?: Planet; south?: Planet };
  coreFull?: { planets?: Planet[] };
  overview?: string;
};

function zhBody(b: string) {
  const map: Record<string, string> = {
    Sun: "太阳",
    Moon: "月亮",
    Mercury: "水星",
    Venus: "金星",
    Mars: "火星",
    Jupiter: "木星",
    Saturn: "土星",
    Uranus: "天王星",
    Neptune: "海王星",
    Pluto: "冥王星",
    ASC: "上升",
    MC: "中天",
    NodeN: "北交点",
    NodeS: "南交点",
  };
  return map[b] || b;
}

function line(p?: Planet) {
  if (!p) return "";
  const deg = typeof p.degree === "number" ? ` · ${p.degree.toFixed(0)}°` : "";
  return `${p.sign} · 第${p.house}宫${deg}`;
}

export default function ReportIntroMerged(props: { keyConfig: KeyConfig; aiOneLine?: string }) {
  const { keyConfig, aiOneLine } = props;

  const core = keyConfig?.core || {};
  const nodes = keyConfig?.nodes || {};
  const planets = keyConfig?.coreFull?.planets || [];

  const yourLines = useMemo(() => {
    const pick = (body: string) => planets.find((x) => x.body === body);

    const list: { k: string; v: string }[] = [
      { k: "太阳", v: line(core.sun) || line(pick("Sun")) },
      { k: "月亮", v: line(core.moon) || line(pick("Moon")) },
      { k: "上升", v: line(core.asc) || line(pick("ASC")) },
      { k: "中天", v: line(core.mc) || line(pick("MC")) },

      { k: "水星", v: line(pick("Mercury")) },
      { k: "金星", v: line(pick("Venus")) },
      { k: "火星", v: line(pick("Mars")) },
      { k: "木星", v: line(pick("Jupiter")) },
      { k: "土星", v: line(core.saturn) || line(pick("Saturn")) },
      { k: "天王星", v: line(pick("Uranus")) },
      { k: "海王星", v: line(pick("Neptune")) },
      { k: "冥王星", v: line(pick("Pluto")) },

      { k: "北交点", v: line(nodes.north) || line(pick("NodeN")) },
      { k: "南交点", v: line(nodes.south) || line(pick("NodeS")) },
    ].filter((x) => x.v);

    return list;
  }, [core, nodes, planets]);

  const oneLine = aiOneLine || keyConfig?.overview || "";

  return (
    <div className="rounded-3xl border border-zinc-800/20 bg-zinc-950/70 p-6 text-zinc-100 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
      <div className="text-sm text-zinc-300">✨ 先读这一段：你在看什么</div>

      {/* 科普区 */}
      <div className="mt-4 space-y-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="font-semibold">太阳代表什么？</div>
          <div className="mt-1 text-sm text-zinc-300">
            太阳=你的“核心驱动力/人生主轴”。它落在哪个星座，说明你会用什么风格发光；落在哪个宫位，说明你主要把能量投在哪个领域。
          </div>
          <div className="mt-3 border-t border-white/10 pt-3 text-sm">
            <span className="text-zinc-300">你的太阳：</span>
            <span className="font-medium">{line(core.sun)}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="font-semibold">月亮代表什么？</div>
          <div className="mt-1 text-sm text-zinc-300">
            月亮=你的“情绪与安全感系统”。你怎么稳定下来、你真正需要的安抚方式、以及亲密关系里最敏感的按钮。
          </div>
          <div className="mt-3 border-t border-white/10 pt-3 text-sm">
            <span className="text-zinc-300">你的月亮：</span>
            <span className="font-medium">{line(core.moon)}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="font-semibold">上升 / 中天代表什么？</div>
          <div className="mt-1 text-sm text-zinc-300">
            上升=别人第一眼感受到的你（你“进入世界”的方式）；中天MC=你会被世界记住的身份与事业角色（社会化路径）。
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 border-t border-white/10 pt-3 text-sm md:grid-cols-2">
            <div>
              <span className="text-zinc-300">你的上升：</span>
              <span className="font-medium">{line(core.asc)}</span>
            </div>
            <div>
              <span className="text-zinc-300">你的中天：</span>
              <span className="font-medium">{line(core.mc)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="font-semibold">宫位是什么？相位是什么？</div>
          <div className="mt-1 text-sm text-zinc-300">
            宫位=人生领域地图（比如 4宫=家庭/根基，10宫=事业/公众形象）。相位=行星之间的“互动结构”（合/冲/刑张力大；拱/六合更顺）。
            orb 越小，影响越强。
          </div>
          <div className="mt-3 border-t border-white/10 pt-3 text-sm">
            <span className="text-zinc-300">一句话概括你的盘：</span>
            <span className="font-semibold">{oneLine || "（AI 生成中…）"}</span>
          </div>
        </div>
      </div>

      {/* ✅ 合并：紧接着输出“你的盘落点清单” */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center gap-2 font-semibold">📌 你的关键落点（直接看你自己）</div>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
          {yourLines.map((x) => (
            <div key={x.k} className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">
              <span className="text-zinc-300">{x.k}</span>
              <span className="mx-2 text-white/30">—</span>
              <span className="font-medium">{x.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
