// app/report/[id]/lifeos-tab.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Activity, Briefcase, Gauge, ShieldAlert, ArrowRight } from "lucide-react";
import type { CareerDevelopmentOutput, TagScore, RoleScore, CareerTag } from "@/lib/career/careerEngine";

type FitLevel = "high" | "conditional" | "risk";
type RoleType = "前线突破位" | "决策参与位" | "执行支持位" | "中控/管理位";
type IndustryType = "新兴高波动行业" | "高速成长型公司" | "成熟行业" | "传统稳定行业";

type MatrixCell = {
  role: RoleType;
  industry: IndustryType;
  level: FitLevel;
  summary: string;
};

function levelBadge(level: FitLevel) {
  if (level === "high") return { text: "高匹配", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" };
  if (level === "conditional") return { text: "有条件", cls: "border-amber-500/30 bg-amber-500/10 text-amber-300" };
  return { text: "高风险", cls: "border-red-500/30 bg-red-500/10 text-red-300" };
}

function dotCls(level: FitLevel) {
  if (level === "high") return "bg-emerald-400";
  if (level === "conditional") return "bg-amber-400";
  return "bg-red-400";
}

function toMap(scores: TagScore[]) {
  const m = new Map<CareerTag, number>();
  for (const s of scores) m.set(s.tag, s.score);
  return m;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function scaleTo100(x: number, max: number) {
  if (max <= 0) return 0;
  return Math.round(clamp01(x / max) * 100);
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
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
          >
            关闭
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-auto custom-scrollbar">{children}</div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.35); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}

// -------- Radar (SVG 简版) --------
function Radar({
  metrics,
}: {
  metrics: { key: string; label: string; value: number; desc: string }[];
}) {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 22;

  const n = metrics.length;
  const pts = metrics.map((m, i) => {
    const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
    const t = clamp01(m.value / 100);
    return { ang, x: cx + Math.cos(ang) * r * t, y: cy + Math.sin(ang) * r * t };
  });

  const poly = pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} className="overflow-visible">
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <circle key={t} cx={cx} cy={cy} r={r * t} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        ))}
        {pts.map((p, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(p.ang) * r}
            y2={cy + Math.sin(p.ang) * r}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        ))}
        <polygon points={poly} fill="rgba(99,102,241,0.18)" stroke="rgba(99,102,241,0.9)" strokeWidth={2} />
        {pts.map((p, i) => {
          const lx = cx + Math.cos(p.ang) * (r + 14);
          const ly = cy + Math.sin(p.ang) * (r + 14);
          const anchor =
            Math.abs(Math.cos(p.ang)) < 0.25 ? "middle" : Math.cos(p.ang) > 0 ? "start" : "end";
          return (
            <text
              key={metrics[i].key}
              x={lx}
              y={ly}
              fontSize={11}
              fill="rgba(255,255,255,0.7)"
              textAnchor={anchor as any}
              dominantBaseline="middle"
            >
              {metrics[i].label}
            </text>
          );
        })}
      </svg>

      <div className="w-full space-y-2 text-xs text-white/60">
        {metrics.map((m) => (
          <div key={m.key} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-bold text-white/80">{m.label}</div>
              <div className="text-white/40">{m.desc}</div>
            </div>
            <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/70">
              {m.value}/100
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StickyHeader({
  osName,
  osEn,
  tagline,
  tags,
}: {
  osName: string;
  osEn: string;
  tagline: string;
  tags: string[];
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <div className="truncate text-base font-black text-white">{osName}</div>
            <div className="truncate text-xs text-white/40 font-mono">{osEn}</div>
          </div>
          <div className="truncate text-xs text-white/50">{tagline}</div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {tags.map((t) => (
            <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhaseTabs({
  phase,
  setPhase,
}: {
  phase: "冲锋期" | "回收期" | "修整期";
  setPhase: (p: "冲锋期" | "回收期" | "修整期") => void;
}) {
  const items: Array<"冲锋期" | "回收期" | "修整期"> = ["冲锋期", "回收期", "修整期"];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((x) => (
        <button
          key={x}
          onClick={() => setPhase(x)}
          className={[
            "px-5 py-2 rounded-2xl border text-sm font-black tracking-tight transition",
            phase === x
              ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-200"
              : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10",
          ].join(" ")}
        >
          {x}
        </button>
      ))}
    </div>
  );
}

function ActionCard({
  title,
  doList,
  avoidList,
  why,
}: {
  title: string;
  doList: string[];
  avoidList: string[];
  why: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[32px] border border-white/10 bg-white/[0.02] p-8">
      <div className="flex items-start justify-between gap-3">
        <div className="text-lg font-black text-white">{title}</div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
        >
          {open ? "收起原因" : "展开原因"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <div className="text-xs font-black uppercase tracking-widest text-emerald-300">✔ 建议做</div>
          <ul className="mt-3 space-y-2 text-white/80 text-sm">
            {doList.map((x) => (
              <li key={x}>• {x}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
          <div className="text-xs font-black uppercase tracking-widest text-red-300">✖ 建议避免</div>
          <ul className="mt-3 space-y-2 text-white/80 text-sm">
            {avoidList.map((x) => (
              <li key={x}>• {x}</li>
            ))}
          </ul>
        </div>
      </div>

      {open ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
          {why}
        </div>
      ) : null}
    </div>
  );
}

function formatTopTags(topTags: TagScore[]) {
  return topTags.map((t) => `${t.tag}(${t.score.toFixed(1)})`).join(" · ");
}

function formatTopRoles(topRoles: RoleScore[]) {
  return topRoles.map((r) => `${r.role}(${r.score.toFixed(1)})`).join(" · ");
}

function buildOSMeta(careerDev: CareerDevelopmentOutput) {
  // 根据 careerArchetype 粗映射 OS（你后面可以换成更精细的 LifeOS 引擎）
  switch (careerDev.careerArchetype) {
    case "RISK_FINANCE":
    case "INNOVATION_BUILD":
      return {
        osName: "高波动进攻型",
        osEn: "Volatile Attacker OS",
        tagline: "非线性机会驱动 · 快验证快放大 · 需要节奏与规则系统",
        tags: ["高风险", "非线性", "决策驱动"],
      };
    case "EXECUTION_SYSTEM":
      return {
        osName: "稳定建造型",
        osEn: "Steady Builder OS",
        tagline: "稳定产出与流程复利 · 长期主义 · 用系统把事做成",
        tags: ["稳健", "复利", "系统化"],
      };
    case "STRATEGY_RESEARCH":
      return {
        osName: "战略研究型",
        osEn: "Strategic Architect OS",
        tagline: "高层框架与判断 · 研究驱动 · 先想清再下场",
        tags: ["策略", "研究", "高维决策"],
      };
    default:
      return {
        osName: "连接放大型",
        osEn: "Connector / Influence OS",
        tagline: "社群与平台放大 · 影响力与资源整合 · 连接决定上限",
        tags: ["社群", "平台", "影响力"],
      };
  }
}

function buildRadarFromTags(tagScores: TagScore[]) {
  const m = toMap(tagScores);

  const get = (k: CareerTag) => m.get(k) || 0;
  const max = Math.max(1, ...tagScores.map((t) => t.score));

  // 6 维映射（你后面可以调权重）
  const risk = get("RiskFinance") + get("Innovation");
  const speed = get("Leadership") + get("Innovation");
  const volatility = get("RiskFinance") + get("Innovation") - get("ServiceOps");
  const patience = get("ManagementSystems") + get("ServiceOps");
  const rules = get("ManagementSystems") + get("ServiceOps") + get("Strategy") * 0.3;
  const nonlinear = get("PublicInfluence") + get("RiskFinance") + get("Innovation");

  return [
    { key: "risk", label: "风险承受", value: scaleTo100(risk, max * 1.8), desc: "风险相关标签越强，越适合波动与不确定环境" },
    { key: "speed", label: "决策速度", value: scaleTo100(speed, max * 1.8), desc: "行动/创新相关标签越强，越偏快节奏推进" },
    { key: "vol", label: "波动适应", value: scaleTo100(volatility, max * 1.8), desc: "高风险+创新与执行系统的差值，体现波动耐受" },
    { key: "pat", label: "长期耐性", value: scaleTo100(patience, max * 1.8), desc: "系统与执行标签越强，越偏长期稳定输出" },
    { key: "rules", label: "规则依赖", value: scaleTo100(rules, max * 1.8), desc: "系统/执行/策略越强，越依赖规则与流程" },
    { key: "nl", label: "非线性回报", value: scaleTo100(nonlinear, max * 1.8), desc: "影响力/风险/创新越强，越易出现跃迁式回报" },
  ];
}

function buildFlowFromArchetype(ar: CareerDevelopmentOutput["careerArchetype"]) {
  // 固定 5 阶段，内容按 archetype 变化
  if (ar === "EXECUTION_SYSTEM") {
    return [
      { id: "setup", title: "搭建系统", keywords: "流程/习惯/标准", strong: ["做成可重复机制", "把复杂拆成 SOP"], pitfall: ["过度完美", "把自己当机器"], tip: "先跑通 60 分版本，再迭代到 90 分。" },
      { id: "deliver", title: "稳定交付", keywords: "交付/质量/复利", strong: ["可持续输出", "把信用做成资产"], pitfall: ["缺乏曝光", "稳定但无跃迁"], tip: "用作品集/里程碑把成果变成可见资产。" },
      { id: "opt", title: "优化升级", keywords: "复盘/指标/改进", strong: ["持续改进", "效率长期抬升"], pitfall: ["只优化不扩张"], tip: "每周期给自己一个“放大点”，别只在细节里打转。" },
      { id: "scale", title: "规模化", keywords: "团队/制度/扩张", strong: ["用制度替代意志", "团队协作"], pitfall: ["控制欲过强"], tip: "把关键标准写下来，让系统替你盯。" },
      { id: "brand", title: "信用资产", keywords: "名声/口碑/权威", strong: ["信用复利", "长期位置"], pitfall: ["只做幕后"], tip: "给自己一个可见身份：对外输出一件代表作。" },
    ];
  }

  // 默认：高波动进攻（也覆盖风险/创新 archetype）
  return [
    { id: "op", title: "机会出现", keywords: "窗口期/突发机会", strong: ["识别机会", "敢下场拿信息优势"], pitfall: ["把所有机会都当窗口期"], tip: "先小仓位验证，再决定是否放大。" },
    { id: "intu", title: "直觉判断", keywords: "快判断/先手", strong: ["在无共识阶段领先", "判断速度快"], pitfall: ["忽略反证"], tip: "写一句反证条件：出现什么信号就撤退。" },
    { id: "test", title: "小规模验证", keywords: "试错/迭代", strong: ["快速修正", "学习速度快"], pitfall: ["验证期太短"], tip: "设定最小样本量（时间/数据/反馈）。" },
    { id: "acc", title: "加速下注", keywords: "放大/进攻", strong: ["放大优势", "快速拉开差距"], pitfall: ["情绪加码/无退出"], tip: "放大必须绑定：仓位上限 + 退出规则 + 冷却时间。" },
    { id: "fb", title: "结果反馈", keywords: "高峰/回撤", strong: ["复盘沉淀方法", "回撤后重启"], pitfall: ["赢了无限复制"], tip: "每次胜利后的第一动作：回收，而不是加码。" },
  ];
}

function buildMatrixSkeleton(careerDev: CareerDevelopmentOutput): MatrixCell[] {
  const roles: RoleType[] = ["前线突破位", "决策参与位", "执行支持位", "中控/管理位"];
  const industries: IndustryType[] = ["新兴高波动行业", "高速成长型公司", "成熟行业", "传统稳定行业"];

  // 用 tag 向量打分，决定每个格子 level（最小可跑通版）
  const m = toMap(careerDev.tagScores);
  const S = {
    risk: (m.get("RiskFinance") || 0) + (m.get("Innovation") || 0),
    sys: (m.get("ManagementSystems") || 0) + (m.get("ServiceOps") || 0),
    net: (m.get("CommunityNetwork") || 0) + (m.get("PublicInfluence") || 0) + (m.get("Communication") || 0),
    strat: (m.get("Strategy") || 0) + (m.get("ResearchDeepWork") || 0),
  };

  function scoreCell(role: RoleType, industry: IndustryType) {
    let s = 0;

    // 行业基底
    if (industry === "新兴高波动行业") s += S.risk * 1.0 + S.net * 0.4 + S.strat * 0.3 - S.sys * 0.2;
    if (industry === "高速成长型公司") s += S.risk * 0.5 + S.net * 0.5 + S.sys * 0.3 + S.strat * 0.2;
    if (industry === "成熟行业") s += S.sys * 0.9 + S.strat * 0.3 - S.risk * 0.3;
    if (industry === "传统稳定行业") s += S.sys * 1.0 - S.risk * 0.6 - S.net * 0.2;

    // 角色基底
    if (role === "前线突破位") s += S.risk * 0.6 + S.net * 0.3 - S.sys * 0.2;
    if (role === "决策参与位") s += S.strat * 0.6 + S.risk * 0.2 + S.net * 0.2;
    if (role === "执行支持位") s += S.sys * 0.6 - S.risk * 0.2;
    if (role === "中控/管理位") s += S.sys * 0.5 + S.strat * 0.2 - S.risk * 0.2;

    return s;
  }

  const rawScores: number[] = [];
  for (const r of roles) for (const i of industries) rawScores.push(scoreCell(r, i));
  const max = Math.max(...rawScores);
  const min = Math.min(...rawScores);

  function toLevel(x: number): FitLevel {
    const t = (x - min) / (max - min + 1e-6);
    if (t >= 0.66) return "high";
    if (t >= 0.38) return "conditional";
    return "risk";
  }

  const cells: MatrixCell[] = [];
  for (const r of roles) {
    for (const i of industries) {
      const s = scoreCell(r, i);
      const level = toLevel(s);
      const summary =
        level === "high"
          ? "你的结构更容易在这里放大优势（建议优先配置）"
          : level === "conditional"
          ? "有条件适配：需要权限/资源/节奏匹配"
          : "高风险：容易长期消耗或触发结构性问题";
      cells.push({ role: r, industry: i, level, summary });
    }
  }
  return cells;
}

function buildActions(careerDev: CareerDevelopmentOutput) {
  // 用 archetype + pitfalls 做一个“可跑通版”的三张卡
  const p = careerDev.pitfalls.map((x) => x.key).slice(0, 3).join(" · ");
  return [
    {
      title: "职业选择建议",
      doList: [
        `优先围绕你的主类型：${careerDev.careerArchetype}`,
        "争取可闭环责任：结果可度量/可复盘",
        "把路径拆成阶段：冲锋-回收-修整",
      ],
      avoidList: [
        "长期低决策权纯执行（除非你是 EXECUTION_SYSTEM）",
        "无规则的高风险放大",
        "在不适配环境里硬熬",
      ],
      why: `你当前的结构性风险点（pitfalls）：${p || "—"}`,
    },
    {
      title: "投资行为建议",
      doList: [
        `你的投资风格类型：${careerDev.investmentArchetype}`,
        "先验证再放大（仓位上限+退出规则）",
        "胜利后的第一动作：回收",
      ],
      avoidList: [
        "情绪加码",
        "不设退出规则",
        "把一次成功逻辑无限复制",
      ],
      why: `投资类型由标签向量推导：topTags = ${formatTopTags(careerDev.topTags)}`,
    },
    {
      title: "自我管理建议",
      doList: [
        "用规则系统保护决策质量",
        "复盘：触发-选择-结果（固定记录）",
        "把成果沉淀成可见资产（作品/信用/案例）",
      ],
      avoidList: [
        "长期过载",
        "用稳定模板强行压制系统特性",
        "回撤后报复性决策",
      ],
      why: `你最强的标签组合：${formatTopTags(careerDev.topTags)}`,
    },
  ];
}

export function LifeOSTab({
  careerDev,
}: {
  careerDev: CareerDevelopmentOutput;
}) {
  const meta = useMemo(() => buildOSMeta(careerDev), [careerDev]);
  const radar = useMemo(() => buildRadarFromTags(careerDev.tagScores), [careerDev]);
  const flow = useMemo(() => buildFlowFromArchetype(careerDev.careerArchetype), [careerDev]);
  const matrix = useMemo(() => buildMatrixSkeleton(careerDev), [careerDev]);
  const actions = useMemo(() => buildActions(careerDev), [careerDev]);

  const [activeStage, setActiveStage] = useState(flow[0].id);
  const [picked, setPicked] = useState<MatrixCell | null>(null);
  const [phase, setPhase] = useState<"冲锋期" | "回收期" | "修整期">("冲锋期");

  const stage = flow.find((x) => x.id === activeStage)!;

  const rhythmAdvice = useMemo(() => {
    // 根据 investmentArchetype 简单切换建议（可跑通）
    if (phase === "冲锋期") return { do: ["验证新机会", "小仓位试错", "写反证条件"], avoid: ["一上来重仓", "无退出规则", "熬夜硬冲"] };
    if (phase === "回收期") return { do: ["回收收益", "固化方法论", "补安全垫"], avoid: ["赢了继续加码", "无限外推", "忽略风险敞口"] };
    return { do: ["修整学习", "补系统/风控", "等待窗口"], avoid: ["无聊就制造风险", "报复性决策", "用刺激续命"] };
  }, [phase]);

  const roles: RoleType[] = ["前线突破位", "决策参与位", "执行支持位", "中控/管理位"];
  const industries: IndustryType[] = ["新兴高波动行业", "高速成长型公司", "成熟行业", "传统稳定行业"];

  const cellMap = useMemo(() => {
    const m = new Map<string, MatrixCell>();
    for (const c of matrix) m.set(`${c.role}__${c.industry}`, c);
    return m;
  }, [matrix]);

  return (
    <div className="text-slate-200">
      <StickyHeader {...meta} />

      <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* Section 1: OS 总览 */}
        <section className="rounded-[48px] border border-indigo-500/20 bg-white/[0.02] p-10 md:p-14 shadow-2xl">
          <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono">
            <Activity size={14} /> LifeOS / 人生操作系统
          </div>

          <div className="mt-6 grid gap-8 md:grid-cols-12">
            <div className="md:col-span-7 space-y-6">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                {meta.osName} <span className="text-white/20 font-mono text-sm ml-2">{meta.osEn}</span>
              </h2>

              <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
                <div className="text-xs font-black text-white/60 uppercase tracking-widest">Core Line</div>
                <div className="mt-3 text-2xl font-medium italic text-white/90 leading-relaxed">
                  “你的职业结构由标签向量决定：{careerDev.careerArchetype} / {careerDev.investmentArchetype}”
                </div>
                <div className="mt-4 text-sm text-white/60">
                  topTags：{formatTopTags(careerDev.topTags)}
                </div>
                <div className="mt-2 text-sm text-white/60">
                  topRoles：{formatTopRoles(careerDev.topRoles)}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {meta.tags.map((t) => (
                  <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    {t}
                  </span>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/10 p-6">
                  <div className="text-xs font-black uppercase tracking-widest text-emerald-300">✔ 优势</div>
                  <div className="mt-3 text-sm text-white/70">
                    由 topTags 决定：{careerDev.topTags.map(t=>t.tag).join(" / ")}
                  </div>
                </div>
                <div className="rounded-[28px] border border-amber-500/20 bg-amber-500/10 p-6">
                  <div className="text-xs font-black uppercase tracking-widest text-amber-300">⚠ 结构性风险</div>
                  <div className="mt-3 text-sm text-white/70">
                    {careerDev.pitfalls.length
                      ? careerDev.pitfalls.slice(0, 3).map(p => p.key).join(" / ")
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 rounded-[40px] border border-white/10 bg-black/30 p-8">
              <div className="text-xs font-black text-white/60 uppercase tracking-widest">Radar / 能量向量</div>
              <div className="mt-6">
                <Radar metrics={radar} />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Flow */}
        <section className="rounded-[48px] border border-white/10 bg-white/[0.02] p-10 md:p-14">
          <div className="flex items-center gap-3 text-slate-400">
            <Activity className="text-indigo-400" />
            <h3 className="text-xl font-bold tracking-widest uppercase">OS Mechanism Flow</h3>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_360px]">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap items-center gap-2">
                {flow.map((s, idx) => (
                  <React.Fragment key={s.id}>
                    <button
                      onClick={() => setActiveStage(s.id)}
                      className={[
                        "rounded-2xl border px-4 py-3 text-left text-sm transition",
                        s.id === activeStage
                          ? "border-indigo-500/30 bg-indigo-500/10 text-white"
                          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
                      ].join(" ")}
                    >
                      <div className="font-black">{s.title}</div>
                      <div className="text-xs text-white/40">{s.keywords}</div>
                    </button>
                    {idx < flow.length - 1 ? <span className="text-white/20">→</span> : null}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.02] p-6">
              <div className="text-lg font-black text-white">{stage.title}</div>
              <div className="mt-1 text-xs text-white/40">{stage.keywords}</div>

              <div className="mt-6">
                <div className="text-xs font-black text-white/60 uppercase tracking-widest">你在这个阶段最强</div>
                <ul className="mt-3 space-y-2 text-sm text-white/75">
                  {stage.strong.map((x) => <li key={x}>• {x}</li>)}
                </ul>
              </div>

              <div className="mt-6">
                <div className="text-xs font-black text-white/60 uppercase tracking-widest">最容易翻车</div>
                <ul className="mt-3 space-y-2 text-sm text-white/75">
                  {stage.pitfall.map((x) => <li key={x}>• {x}</li>)}
                </ul>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                <span className="font-black text-white">提示：</span>{stage.tip}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Career × Industry Matrix */}
        <section className="rounded-[48px] border border-white/10 bg-white/[0.02] p-10 md:p-14">
          <div className="flex items-center gap-3 text-slate-400">
            <Briefcase className="text-indigo-400" />
            <h3 className="text-xl font-bold tracking-widest uppercase">Career × Industry Matrix</h3>
          </div>

          <div className="mt-8 overflow-x-auto">
            <div className="min-w-[900px] grid grid-cols-[160px_repeat(4,1fr)] gap-3">
              <div />
              {industries.map((ind) => (
                <div key={ind} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-black text-white/80">
                  {ind}
                </div>
              ))}

              {roles.map((role) => (
                <React.Fragment key={role}>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-black text-white/80">
                    {role}
                  </div>

                  {industries.map((ind) => {
                    const c = cellMap.get(`${role}__${ind}`);
                    if (!c) {
                      return (
                        <div key={ind} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white/30 text-sm">
                          —
                        </div>
                      );
                    }
                    const b = levelBadge(c.level);
                    return (
                      <button
                        key={ind}
                        onClick={() => setPicked(c)}
                        className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left hover:bg-white/[0.06] transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${dotCls(c.level)}`} />
                            <div className="text-sm font-black text-white">{b.text}</div>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${b.cls}`}>
                            {b.text}
                          </span>
                        </div>
                        <div className="mt-3 text-sm text-white/70 leading-relaxed">
                          {c.summary}
                        </div>
                        <div className="mt-3 text-xs text-white/40 flex items-center gap-2">
                          点击展开 <ArrowRight size={14} />
                        </div>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          <Modal
            open={!!picked}
            title={picked ? `${picked.role} × ${picked.industry}` : ""}
            onClose={() => setPicked(null)}
          >
            {picked ? (
              <div className="space-y-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${levelBadge(picked.level).cls} text-xs font-black`}>
                  <span className={`h-2 w-2 rounded-full ${dotCls(picked.level)}`} />
                  {levelBadge(picked.level).text}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="text-sm font-black text-white/70 uppercase tracking-widest">Summary</div>
                  <div className="mt-3 text-lg text-white/85 leading-relaxed">{picked.summary}</div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="text-sm font-black text-indigo-300 uppercase tracking-widest">当前命中（动态）</div>
                  <div className="mt-3 text-sm text-white/70">
                    topTags：{formatTopTags(careerDev.topTags)}
                  </div>
                  <div className="mt-2 text-sm text-white/70">
                    topRoles：{formatTopRoles(careerDev.topRoles)}
                  </div>
                  <div className="mt-2 text-sm text-white/70">
                    pitfalls：{careerDev.pitfalls.length ? careerDev.pitfalls.slice(0, 3).map(p=>p.key).join(" · ") : "—"}
                  </div>
                </div>

                <div className="text-xs text-white/40">
                  注：矩阵等级由标签向量推导（可解释、可复盘），不是“命定职业”。
                </div>
              </div>
            ) : null}
          </Modal>
        </section>

        {/* Section 4: Rhythm / Risk */}
        <section className="rounded-[48px] border border-white/10 bg-white/[0.02] p-10 md:p-14">
          <div className="flex items-center gap-3 text-slate-400">
            <Gauge className="text-indigo-400" />
            <h3 className="text-xl font-bold tracking-widest uppercase">Risk & Rhythm</h3>
          </div>

          <div className="mt-8 grid md:grid-cols-12 gap-6">
            <div className="md:col-span-8 rounded-[40px] bg-gradient-to-br from-slate-900 to-black border border-slate-800 p-10">
              <PhaseTabs phase={phase} setPhase={setPhase} />

              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8">
                  <div className="text-xs font-black uppercase tracking-widest text-emerald-300">建议做</div>
                  <ul className="mt-4 space-y-2 text-white/80">
                    {rhythmAdvice.do.map((x) => <li key={x}>• {x}</li>)}
                  </ul>
                </div>
                <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
                  <div className="text-xs font-black uppercase tracking-widest text-red-300">避免</div>
                  <ul className="mt-4 space-y-2 text-white/80">
                    {rhythmAdvice.avoid.map((x) => <li key={x}>• {x}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 rounded-[40px] bg-red-950/20 border border-red-500/30 p-10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-red-400">
                  <ShieldAlert size={20} />
                  <span className="font-black uppercase tracking-widest text-xs">Hard Rule</span>
                </div>
                <p className="text-lg font-medium text-red-100/80 italic leading-relaxed">
                  “不要让一次判断决定你全部筹码。”
                </p>
              </div>
              <div className="text-[10px] text-red-500/50 font-mono mt-8">
                SYSTEM_WARNING: RULES_REQUIRED
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Action Cards */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-slate-400 px-2">
            <Briefcase className="text-indigo-400" />
            <h3 className="text-xl font-bold tracking-widest uppercase">Action Cards</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {actions.map((a) => (
              <ActionCard
                key={a.title}
                title={a.title}
                doList={a.doList}
                avoidList={a.avoidList}
                why={a.why}
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="rounded-[32px] border border-white/10 bg-white/[0.02] p-6 text-xs text-white/50">
          本页输出由「Placements → Evidence → TagScores → RoleScores」链路计算得出；属于结构性倾向，不构成投资建议。
        </div>
      </div>
    </div>
  );
}
