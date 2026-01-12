// components/ReportShell.tsx
"use client";

import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Mode = "free" | "A" | "B" | "C";
type ReportModule = { id: number; title: string; markdown: string };
type DeepReport = { A?: string; B?: string; C?: string };
type DeepMode = "A" | "B" | "C";

const DEEP_BUTTONS: { mode: DeepMode; label: string; icon: string }[] = [
  { mode: "A", label: "关系 / 情感", icon: "💗" },
  { mode: "B", label: "事业 / 财富", icon: "💼" },
  { mode: "C", label: "灵魂 / 创伤", icon: "🧿" },
];

const SIGN_MAP: Record<string, string> = {
  Aries: "白羊座", Taurus: "金牛座", Gemini: "双子座", Cancer: "巨蟹座",
  Leo: "狮子座", Virgo: "处女座", Libra: "天秤座", Scorpio: "天蝎座",
  Sagittarius: "射手座", Capricorn: "摩羯座", Aquarius: "水瓶座", Pisces: "双鱼座",
};

const translateSign = (s: string) => SIGN_MAP[s] || s;

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-3xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-4 px-8 pt-8">
      <div className="h-12 w-12 rounded-2xl border border-gray-200 bg-gray-50 grid place-items-center text-xl">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-2xl font-extrabold tracking-tight text-gray-900">{title}</div>
        {subtitle ? <div className="mt-2 text-sm text-gray-600">{subtitle}</div> : null}
      </div>
    </div>
  );
}

function Pill({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: "gray" | "red" | "green" | "blue";
}) {
  const cls =
    tone === "red"
      ? "border-red-200 bg-red-50 text-red-700"
      : tone === "green"
      ? "border-green-200 bg-green-50 text-green-700"
      : tone === "blue"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : "border-gray-200 bg-gray-50 text-gray-700";

  return <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${cls}`}>{children}</span>;
}

function HardcodedInfo({ keyConfig }: { keyConfig: any }) {
  const input = keyConfig?.input;
  const core = keyConfig?.core;
  if (!input || !core) return null;

  const sunSign = translateSign(core.sun?.sign);
  const moonSign = translateSign(core.moon?.sign);
  const ascSign = translateSign(core.asc?.sign);
  const mcSign = translateSign(core.mc?.sign);

  return (
    <div className="px-8 pb-8 pt-6">
      <div className="flex flex-wrap gap-2">
        <Pill>👤 {input.name || "未命名"}</Pill>
        <Pill>📍 {input.city}</Pill>
        <Pill>⏳ UTC{input.utcOffset}</Pill>
        <Pill>🗓️ {String(input.birthDateTime).split("T")[0]}</Pill>
        <Pill>🕒 {String(input.birthDateTime).split("T")[1]?.slice(0, 5)}</Pill>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-sm font-semibold text-gray-900">☀️ 太阳</div>
          <div className="mt-1 text-sm text-gray-700">{sunSign} · 第 {core.sun?.house} 宫</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-sm font-semibold text-gray-900">🌙 月亮</div>
          <div className="mt-1 text-sm text-gray-700">{moonSign} · 第 {core.moon?.house} 宫</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-sm font-semibold text-gray-900">⬆️ 上升</div>
          <div className="mt-1 text-sm text-gray-700">{ascSign} · 第 1 宫</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-sm font-semibold text-gray-900">🎯 中天</div>
          <div className="mt-1 text-sm text-gray-700">{mcSign} · 第 10 宫</div>
        </div>
      </div>
    </div>
  );
}

function PlanetHouseTable({ keyConfig }: { keyConfig: any }) {
  const planets = keyConfig?.coreFull?.planets || [];
  if (!Array.isArray(planets) || planets.length === 0) {
    return (
      <div className="px-8 pb-8 text-sm text-gray-500">
        暂无全量行星数据（需要 chart API 把 planets 的 lon/sign/house 补全）。
      </div>
    );
  }

  return (
    <div className="px-8 pb-8 pt-4">
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">行星</th>
              <th className="px-4 py-3 text-left font-semibold">星座</th>
              <th className="px-4 py-3 text-left font-semibold">度数</th>
              <th className="px-4 py-3 text-left font-semibold">宫位</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {planets.map((p: any) => (
              <tr key={p.body}>
                <td className="px-4 py-3 font-medium text-gray-900">{p.body}</td>
                <td className="px-4 py-3 text-gray-700">{translateSign(p.sign || "")}</td>
                <td className="px-4 py-3 text-gray-700">{Number.isFinite(p.degree) ? `${p.degree.toFixed(2)}°` : "-"}</td>
                <td className="px-4 py-3 text-gray-700">{p.house ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        ✅ 这是“结构化稳定数据”，不依赖 AI 输出。
      </div>
    </div>
  );
}

function AspectTable({ keyConfig }: { keyConfig: any }) {
  const aspects = keyConfig?.coreFull?.aspectsFull || [];
  if (!Array.isArray(aspects) || aspects.length === 0) {
    return (
      <div className="px-8 pb-8 text-sm text-gray-500">
        暂无全量相位数据（需要 planets lon 完整，才能生成 0/60/90/120/180/合相）。
      </div>
    );
  }

  const label = (t: string) => {
    if (t === "CONJ") return "合相 0°";
    if (t === "SEXT") return "六合 60°";
    if (t === "SQR") return "刑相 90°";
    if (t === "TRI") return "拱相 120°";
    if (t === "OPP") return "冲相 180°";
    return t;
  };

  return (
    <div className="px-8 pb-8 pt-4">
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">A</th>
              <th className="px-4 py-3 text-left font-semibold">相位</th>
              <th className="px-4 py-3 text-left font-semibold">B</th>
              <th className="px-4 py-3 text-left font-semibold">容许度</th>
              <th className="px-4 py-3 text-left font-semibold">实际角距</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {aspects.map((a: any, idx: number) => (
              <tr key={`${a.a}-${a.b}-${a.type}-${idx}`}>
                <td className="px-4 py-3 font-medium text-gray-900">{a.a}</td>
                <td className="px-4 py-3 text-gray-700">{label(a.type)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{a.b}</td>
                <td className="px-4 py-3 text-gray-700">{Number(a.orb).toFixed(2)}°</td>
                <td className="px-4 py-3 text-gray-700">{Number(a.delta).toFixed(2)}°</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        ✅ 包含外行星（天王/海王/冥王）相位，只要你的 planets 列表里带了它们。
      </div>
    </div>
  );
}

function ReportMarkdown({ markdown }: { markdown: string }) {
  const processed = useMemo(() => markdown || "", [markdown]);

  return (
    <div className="prose prose-sm prose-zinc max-w-none prose-headings:scroll-mt-24">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{processed}</ReactMarkdown>
    </div>
  );
}

export default function ReportShell({
  summary,
  modules,
  deep,
  setMode,
  keyConfig,
  loading,
  contentAvailable,
}: {
  summary: string;
  modules: ReportModule[];
  deep: DeepReport;
  setMode: (mode: Mode) => void;
  keyConfig: any;
  loading: boolean;
  contentAvailable: boolean;
}) {
  const [expanded, setExpanded] = useState<number | null>(1);
  const [deepMode, setDeepMode] = useState<DeepMode | null>(null);

  const activeDeep = deepMode ? deep[deepMode] : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-12 space-y-6">
        <Card>
          <CardHeader
            icon="✨"
            title={`${keyConfig?.input?.name || "你"} 的结构化本命盘`}
            subtitle="🌍 地区用于经纬度 ｜ ⏳ 时区用 UTC 偏移（手选更稳）"
          />
          <HardcodedInfo keyConfig={keyConfig} />

          <div className="px-8 pb-8">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 font-semibold text-blue-900">
                🧠 一句话总览
                {loading && !summary ? <span className="text-xs text-blue-700">生成中…</span> : null}
              </div>
              <div className="mt-2 text-sm text-blue-900/90">
                {summary || (contentAvailable ? "内容为空或生成失败" : "AI 内容正在加载中，请稍候…")}
              </div>
            </div>
          </div>
        </Card>

        {/* ✅ 结构化稳定速查表 */}
        <Card>
          <CardHeader
            icon="📌"
            title="行星 × 宫位 全量速查表"
            subtitle="这部分来自服务端结构化数据，不依赖 AI。"
          />
          <PlanetHouseTable keyConfig={keyConfig} />
        </Card>

        <Card>
          <CardHeader
            icon="🔗"
            title="行星 × 行星 × 相位 全量速查表"
            subtitle="自动生成：合相/六合/刑/拱/冲（0/60/90/120/180）。"
          />
          <AspectTable keyConfig={keyConfig} />
        </Card>

        {/* ✅ 深度按钮（A/B/C） */}
        <Card>
          <div className="px-8 pt-8">
            <div className="text-lg font-extrabold text-gray-900">深度报告</div>
            <div className="mt-2 text-sm text-gray-600">点击后会生成更深入的 A/B/C（不影响免费版结构）。</div>
            <div className="mt-4 flex flex-wrap gap-3">
              {DEEP_BUTTONS.map((b) => (
                <button
                  key={b.mode}
                  onClick={() => {
                    setDeepMode(b.mode);
                    if (!deep[b.mode]) setMode(b.mode);
                  }}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${
                    deepMode === b.mode ? "border-black bg-black text-white" : "border-gray-200 bg-white text-gray-900"
                  }`}
                >
                  {b.icon} {b.label} {b.mode}
                </button>
              ))}
              <button
                onClick={() => setDeepMode(null)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm"
              >
                📚 返回模块版
              </button>
            </div>
          </div>

          <div className="px-8 pb-8 pt-6">
            {deepMode && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="text-sm font-semibold text-gray-900 mb-3">
                  {deepMode === "A" ? "💗 深度 A：关系/亲密" : deepMode === "B" ? "💼 深度 B：事业/财富" : "🧿 深度 C：心理/创伤"}
                </div>
                <div className="text-sm text-gray-700">
                  {activeDeep ? <ReportMarkdown markdown={activeDeep} /> : "生成中…"}
                </div>
              </div>
            )}

            {!deepMode && (
              <div className="space-y-3">
                {modules.map((m) => {
                  const open = expanded === m.id;
                  const isSkeleton = !m.markdown;
                  return (
                    <div key={m.id} className="rounded-3xl border border-gray-200 bg-white shadow-sm">
                      <button
                        className="w-full px-6 py-5 flex items-center justify-between"
                        onClick={() => setExpanded(open ? null : m.id)}
                      >
                        <div className="text-left">
                          <div className="text-base font-extrabold text-gray-900">#{m.id} {m.title.replace(/^##\s*\d+\s*/,"")}</div>
                          <div className="mt-1 text-xs text-gray-500">
                            {open ? "点击收起" : "点击展开"} {isSkeleton ? "· 生成中…" : ""}
                          </div>
                        </div>
                        <div className="text-gray-400">{open ? "▴" : "▾"}</div>
                      </button>

                      {open && (
                        <div className="px-6 pb-6">
                          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                            {isSkeleton ? (
                              <div className="space-y-2 animate-pulse">
                                <div className="h-4 w-full rounded bg-gray-200" />
                                <div className="h-4 w-11/12 rounded bg-gray-200" />
                                <div className="h-4 w-10/12 rounded bg-gray-200" />
                              </div>
                            ) : (
                              <ReportMarkdown markdown={m.markdown} />
                            )}
                          </div>

                          <div className="mt-4 flex justify-end gap-2">
                            <button className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs text-green-700">
                              ✅ 我认可
                            </button>
                            <button className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700">
                              ❌ 不太符合
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <div className="text-center text-xs text-gray-500">
          🔒 结构化数据已存服务端（轻量存储），报告页稳定可复现。
        </div>
      </div>
    </main>
  );
}
