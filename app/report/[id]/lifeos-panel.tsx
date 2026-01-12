// app/report/[id]/lifeos-panel.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Activity, Briefcase, Gauge, ShieldAlert, ArrowRight } from "lucide-react";
import type { CareerDevelopmentOutput, TagScore, RoleScore, CareerTag } from "@/lib/career/careerEngine";
import { ROLE_LIBRARY } from "@/lib/rolelibrary";

// ✅ 结构显影组件
import { SystemBlocks } from "./SystemBlocks";
import { TriggerMap } from "./TriggerMap";

type FitLevel = "high" | "conditional" | "risk";
type RoleType = "前线突破位" | "决策参与位" | "执行支持位" | "中控/管理位";
type IndustryType = "新兴高波动行业" | "高速成长型公司" | "成熟行业" | "传统稳定行业";

type MatrixCell = {
  role: RoleType;
  industry: IndustryType;
  level: FitLevel;
  summary: string;
};

const ARCHETYPE_ZH: Record<CareerDevelopmentOutput["careerArchetype"], { name: string; oneLine: string }> = {
  EXECUTION_SYSTEM: { name: "执行系统型", oneLine: "靠流程/交付/复利把事做成，稳定产出是你的优势。" },
  STRATEGY_RESEARCH: { name: "战略研究型", oneLine: "靠框架/洞察/判断取胜，先想清再出手。" },
  NETWORK_INFLUENCE: { name: "连接影响型", oneLine: "靠表达/人脉/平台放大资源，网络效应决定上限。" },
  RISK_FINANCE: { name: "风险金融型", oneLine: "擅长深水区与资源博弈，高风险高回报需要规则护航。" },
  INNOVATION_BUILD: { name: "创新构建型", oneLine: "靠创新/推进/构建实现跃迁，适合新事物与新战场。" },
};

const INVEST_ZH: Record<CareerDevelopmentOutput["investmentArchetype"], { name: string; oneLine: string }> = {
  COMPOUND_STRUCTURAL: { name: "结构复利型", oneLine: "偏长期、看重确定性与结构优势，用时间换复利。" },
  NARRATIVE_ATTACK: { name: "叙事进攻型", oneLine: "偏窗口期与弹性，靠节奏与共识放大收益。" },
  RESEARCH_ARBITRAGE: { name: "研究套利型", oneLine: "偏信息差与理解差，用研究获得赔率优势。" },
  EMOTION_CYCLE: { name: "情绪周期型", oneLine: "更受市场情绪/波动驱动，纪律与退出规则最关键。" },
};

const TAG_ZH: Record<CareerTag, string> = {
  Leadership: "领导/决策",
  ManagementSystems: "系统/管理",
  Strategy: "战略/宏观",
  Communication: "表达/传播",
  ProductBuilder: "产品/构建",
  ResearchDeepWork: "研究/深度",
  PublicInfluence: "公众影响力",
  CommunityNetwork: "社群/人脉",
  MoneyAssets: "金钱/资产",
  ServiceOps: "执行/运营",
  Innovation: "创新/破局",
  RiskFinance: "风险金融",
};

const PITFALL_ZH: Record<string, string> = {
  RISK_OVERLOAD_LOW_SYSTEM: "高风险放大但缺系统（易被一次错误清空）",
  RELATIONSHIP_DRAIN: "关系/曝光消耗过大（边界不足导致耗损）",
  ANALYSIS_PARALYSIS: "过度分析拖慢行动（想太多/出手太晚）",
  STABLE_NO_BREAKOUT: "稳定但缺跃迁（长期陷入重复优化）",
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
function toTagMap(scores: TagScore[]) {
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

function formatTopTags(topTags: TagScore[]) {
  return topTags.map((t) => `${TAG_ZH[t.tag]}(${t.score.toFixed(1)})`).join(" · ");
}
function formatTopRoles(topRoles: RoleScore[]) {
  return topRoles
    .map((r) => {
      const meta = (ROLE_LIBRARY as any)?.[r.role];
      const zh = meta?.nameZh || r.role;
      return `${zh}(${r.score.toFixed(1)})`;
    })
    .join(" · ");
}
function formatPitfalls(p: CareerDevelopmentOutput["pitfalls"]) {
  if (!p?.length) return "—";
  return p
    .slice(0, 3)
    .map((x) => PITFALL_ZH[x.key] || x.key)
    .join(" / ");
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

// ===== Radar =====
function Radar({ metrics }: { metrics: { key: string; label: string; value: number; desc: string }[] }) {
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
          const anchor = Math.abs(Math.cos(p.ang)) < 0.25 ? "middle" : Math.cos(p.ang) > 0 ? "start" : "end";
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

function buildRadarFromTags(tagScores: TagScore[]) {
  const m = toTagMap(tagScores);
  const get = (k: CareerTag) => m.get(k) || 0;
  const max = Math.max(1, ...tagScores.map((t) => t.score));

  const risk = get("RiskFinance") + get("Innovation");
  const speed = get("Leadership") + get("Innovation");
  const volatility = get("RiskFinance") + get("Innovation") - get("ServiceOps");
  const patience = get("ManagementSystems") + get("ServiceOps");
  const rules = get("ManagementSystems") + get("ServiceOps") + get("Strategy") * 0.3;
  const nonlinear = get("PublicInfluence") + get("RiskFinance") + get("Innovation");

  return [
    { key: "risk", label: "风险承受", value: scaleTo100(risk, max * 1.8), desc: "风险/创新越强，越适合波动与不确定环境" },
    { key: "speed", label: "决策速度", value: scaleTo100(speed, max * 1.8), desc: "领导/创新越强，越偏快节奏推进" },
    { key: "vol", label: "波动适应", value: scaleTo100(volatility, max * 1.8), desc: "风险+创新相对执行系统的差值" },
    { key: "pat", label: "长期耐性", value: scaleTo100(patience, max * 1.8), desc: "系统/执行越强，越能长期稳定输出" },
    { key: "rules", label: "规则依赖", value: scaleTo100(rules, max * 1.8), desc: "越依赖规则/流程，越需要明确边界与SOP" },
    { key: "nl", label: "非线性回报", value: scaleTo100(nonlinear, max * 1.8), desc: "影响力/风险/创新越强，越容易跃迁" },
  ];
}

function buildFlow(ar: CareerDevelopmentOutput["careerArchetype"]) {
  if (ar === "EXECUTION_SYSTEM") {
    return [
      { id: "setup", title: "搭建系统", keywords: "流程/习惯/标准", strong: ["做成可重复机制", "把复杂拆成 SOP"], pitfall: ["过度完美", "把自己当机器"], tip: "先跑通 60 分版本，再迭代到 90 分。" },
      { id: "deliver", title: "稳定交付", keywords: "交付/质量/复利", strong: ["可持续输出", "把信用做成资产"], pitfall: ["缺乏曝光", "稳定但无跃迁"], tip: "用里程碑把成果变成可见资产。" },
      { id: "opt", title: "优化升级", keywords: "复盘/指标/改进", strong: ["持续改进", "效率长期抬升"], pitfall: ["只优化不扩张"], tip: "每周期给自己一个“放大点”，别只在细节里打转。" },
      { id: "scale", title: "规模化", keywords: "团队/制度/扩张", strong: ["用制度替代意志", "团队协作"], pitfall: ["控制欲过强"], tip: "把关键标准写下来，让系统替你盯。" },
      { id: "brand", title: "信用资产", keywords: "名声/口碑/权威", strong: ["信用复利", "长期位置"], pitfall: ["只做幕后"], tip: "给自己一个可见身份：对外输出一件代表作。" },
    ];
  }
  return [
    { id: "op", title: "机会出现", keywords: "窗口期/突发机会", strong: ["识别机会", "敢下场拿信息优势"], pitfall: ["把所有机会都当窗口期"], tip: "先小仓位验证，再决定是否放大。" },
    { id: "intu", title: "直觉判断", keywords: "快判断/先手", strong: ["无共识阶段领先", "判断速度快"], pitfall: ["忽略反证"], tip: "写一句反证条件：出现什么信号就撤退。" },
    { id: "test", title: "小规模验证", keywords: "试错/迭代", strong: ["快速修正", "学习速度快"], pitfall: ["验证期太短"], tip: "设定最小样本量（时间/数据/反馈）。" },
    { id: "acc", title: "加速下注", keywords: "放大/进攻", strong: ["放大优势", "快速拉开差距"], pitfall: ["情绪加码/无退出"], tip: "放大必须绑定：仓位上限 + 退出规则 + 冷却时间。" },
    { id: "fb", title: "结果反馈", keywords: "高峰/回撤", strong: ["复盘沉淀方法", "回撤后重启"], pitfall: ["赢了无限复制"], tip: "胜利后的第一动作：回收，而不是加码。" },
  ];
}

function buildMatrix(careerDev: CareerDevelopmentOutput): MatrixCell[] {
  const roles: RoleType[] = ["前线突破位", "决策参与位", "执行支持位", "中控/管理位"];
  const industries: IndustryType[] = ["新兴高波动行业", "高速成长型公司", "成熟行业", "传统稳定行业"];

  const m = toTagMap(careerDev.tagScores);
  const S = {
    risk: (m.get("RiskFinance") || 0) + (m.get("Innovation") || 0),
    sys: (m.get("ManagementSystems") || 0) + (m.get("ServiceOps") || 0),
    net: (m.get("CommunityNetwork") || 0) + (m.get("PublicInfluence") || 0) + (m.get("Communication") || 0),
    strat: (m.get("Strategy") || 0) + (m.get("ResearchDeepWork") || 0),
  };

  function scoreCell(role: RoleType, industry: IndustryType) {
    let s = 0;
    if (industry === "新兴高波动行业") s += S.risk * 1.0 + S.net * 0.4 + S.strat * 0.3 - S.sys * 0.2;
    if (industry === "高速成长型公司") s += S.risk * 0.5 + S.net * 0.5 + S.sys * 0.3 + S.strat * 0.2;
    if (industry === "成熟行业") s += S.sys * 0.9 + S.strat * 0.3 - S.risk * 0.3;
    if (industry === "传统稳定行业") s += S.sys * 1.0 - S.risk * 0.6 - S.net * 0.2;

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
          ? "结构放大优势（优先配置）"
          : level === "conditional"
          ? "有条件适配（需要权限/资源/节奏匹配）"
          : "高风险（易长期消耗/触发结构性问题）";
      cells.push({ role: r, industry: i, level, summary });
    }
  }
  return cells;
}

// =========================
// ✅ Chips（修复：允许换行 + 限宽 + 省略）
// =========================
function Chips({ items, tone }: { items: string[]; tone: "good" | "bad" }) {
  const cls =
    tone === "good"
      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
      : "border-red-500/25 bg-red-500/10 text-red-100";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((x) => (
        <span
          key={x}
          title={x}
          className={[
            "px-3 py-2 rounded-2xl border text-sm leading-snug",
            // ✅ 不要 nowrap，否则会挤爆
            "whitespace-normal break-words",
            // ✅ 防止长句撑爆布局
            "max-w-full md:max-w-[360px]",
            // ✅ 超长省略，hover 看全
            "truncate",
            cls,
          ].join(" ")}
        >
          {x}
        </span>
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

  const doTop = doList.slice(0, 7);
  const avoidTop = avoidList.slice(0, 7);

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/[0.02] p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-black text-white">{title}</div>
          <div className="mt-1 text-xs text-white/40">
            三卡竖排 · 卡内两列横向阅读 · 长解释折叠
          </div>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
        >
          {open ? "收起原因" : "展开原因"}
        </button>
      </div>

      {/* ✅ 卡内左右两列：横向读 */}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/10 p-6">
          <div className="text-xs font-black uppercase tracking-widest text-emerald-200">
            ✔ 建议做
          </div>
          <div className="mt-4">
            <Chips items={doTop} tone="good" />
          </div>
        </div>

        <div className="rounded-3xl border border-red-500/25 bg-red-500/10 p-6">
          <div className="text-xs font-black uppercase tracking-widest text-red-200">
            ✖ 建议避免
          </div>
          <div className="mt-4">
            <Chips items={avoidTop} tone="bad" />
          </div>
        </div>
      </div>

      {open ? (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 leading-relaxed">
          {why}
        </div>
      ) : null}
    </div>
  );
}

export function LifeOSPanel({ careerDev }: { careerDev: CareerDevelopmentOutput }) {
  const radar = useMemo(() => buildRadarFromTags(careerDev.tagScores), [careerDev]);
  const flow = useMemo(() => buildFlow(careerDev.careerArchetype), [careerDev.careerArchetype]);
  const matrix = useMemo(() => buildMatrix(careerDev), [careerDev]);

  const [activeStage, setActiveStage] = useState(flow[0].id);
  const [picked, setPicked] = useState<MatrixCell | null>(null);
  const [phase, setPhase] = useState<"冲锋期" | "回收期" | "修整期">("冲锋期");

  const stage = flow.find((x) => x.id === activeStage)!;

  const roles: RoleType[] = ["前线突破位", "决策参与位", "执行支持位", "中控/管理位"];
  const industries: IndustryType[] = ["新兴高波动行业", "高速成长型公司", "成熟行业", "传统稳定行业"];

  const cellMap = useMemo(() => {
    const m = new Map<string, MatrixCell>();
    for (const c of matrix) m.set(`${c.role}__${c.industry}`, c);
    return m;
  }, [matrix]);

  const rhythmAdvice = useMemo(() => {
    if (phase === "冲锋期") return { do: ["验证新机会", "小仓位试错", "写反证条件"], avoid: ["一上来重仓", "无退出规则", "熬夜硬冲"] };
    if (phase === "回收期") return { do: ["回收收益", "固化方法论", "补安全垫"], avoid: ["赢了继续加码", "无限外推", "忽略风险敞口"] };
    return { do: ["修整学习", "补系统/风控", "等待窗口"], avoid: ["无聊就制造风险", "报复性决策", "用刺激续命"] };
  }, [phase]);

  const actions = useMemo(() => {
    const a = ARCHETYPE_ZH[careerDev.careerArchetype];
    const inv = INVEST_ZH[careerDev.investmentArchetype];
    const pit = formatPitfalls(careerDev.pitfalls);

    return [
      {
        title: "职业选择建议",
        doList: [
          `围绕主类型：${a.name}`,
          "争取闭环责任：结果可度量/可复盘",
          "把路径拆成阶段：冲锋-回收-修整",
          "优先选择“对外可见成果”的岗位",
          "建立合作模板/边界规则",
        ],
        avoidList: ["长期低决策权纯执行（除非执行系统型）", "无规则的高风险放大", "在不适配环境里硬熬", "靠情绪维持节奏"],
        why: `你的主轴是「${a.oneLine}」；当前结构性风险：${pit}`,
      },
      {
        title: "投资行为建议",
        doList: [
          `投资风格：${inv.name}`,
          "先验证再放大（仓位上限+退出规则）",
          "胜利后的第一动作：回收",
          "用研究获得赔率，而不是追涨情绪",
        ],
        avoidList: ["情绪加码", "不设退出规则", "把一次成功逻辑无限复制", "亏损后报复性下单"],
        why: `${inv.oneLine} · topTags：${formatTopTags(careerDev.topTags)}`,
      },
      {
        title: "自我管理建议",
        doList: [
          "用规则系统保护决策质量",
          "固定复盘：触发-选择-结果",
          "把成果沉淀成可见资产（作品/信用/案例）",
          "只维护 Top 关系，减少耗损",
        ],
        avoidList: ["长期过载", "用稳定模板压制系统特性", "回撤后报复性决策", "在关系里无底线付出"],
        why: `topRoles：${formatTopRoles(careerDev.topRoles)}`,
      },
    ];
  }, [careerDev]);

  const archetype = ARCHETYPE_ZH[careerDev.careerArchetype];
  const invest = INVEST_ZH[careerDev.investmentArchetype];

  return (
    <div className="space-y-16">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[48px] border border-indigo-500/30 bg-[#0A0B14] p-10 md:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none">
          <Activity size={200} className="text-indigo-500" />
        </div>

        <div className="relative z-10 space-y-10">
          <div className="flex items-center gap-3 text-slate-400">
            <Activity className="text-indigo-400" />
            <h3 className="text-xl font-bold tracking-widest uppercase">LIFEOS / 人生操作系统</h3>
          </div>

          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-7 space-y-6">
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
                <div className="text-xs font-black text-white/60 uppercase tracking-widest">Dynamic Summary</div>

                <div className="mt-4">
                  <div className="text-sm text-white/50">职业主类型</div>
                  <div className="text-2xl font-black text-white">{archetype.name}</div>
                  <div className="mt-2 text-sm text-white/70">{archetype.oneLine}</div>
                </div>

                <div className="mt-6">
                  <div className="text-sm text-white/50">投资风格类型</div>
                  <div className="text-xl font-black text-white">{invest.name}</div>
                  <div className="mt-2 text-sm text-white/70">{invest.oneLine}</div>
                </div>

                <div className="mt-6 text-sm text-white/60">优势向量：{formatTopTags(careerDev.topTags)}</div>
                <div className="mt-2 text-sm text-white/60">角色倾向：{formatTopRoles(careerDev.topRoles)}</div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/10 p-6">
                  <div className="text-xs font-black uppercase tracking-widest text-emerald-300">✔ 优势向量</div>
                  <div className="mt-3 text-sm text-white/70">
                    {careerDev.topTags.map((t) => TAG_ZH[t.tag]).join(" / ")}
                  </div>
                </div>
                <div className="rounded-[28px] border border-amber-500/20 bg-amber-500/10 p-6">
                  <div className="text-xs font-black uppercase tracking-widest text-amber-300">⚠ 风险向量</div>
                  <div className="mt-3 text-sm text-white/70">
                    {formatPitfalls(careerDev.pitfalls)}
                  </div>
                </div>
              </div>
            </div>

            {/* Radar */}
            <div className="md:col-span-5 rounded-[40px] border border-white/10 bg-black/30 p-8">
              <div className="text-xs font-black text-white/60 uppercase tracking-widest">RADAR / 能量向量</div>
              <div className="mt-6">
                <Radar metrics={radar} />
              </div>
            </div>
          </div>

          {/* ✅ TriggerMap + SystemBlocks */}
          <div className="space-y-8">
            <TriggerMap evidence={careerDev.evidence} />
            <SystemBlocks tagScores={careerDev.tagScores} />
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="rounded-[48px] border border-white/10 bg-white/[0.02] p-10 md:p-16">
        <div className="flex items-center gap-3 text-slate-400">
          <Activity className="text-indigo-400" />
          <h3 className="text-xl font-bold tracking-widest uppercase">OS MECHANISM FLOW</h3>
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
                {stage.strong.map((x: string) => <li key={x}>• {x}</li>)}
              </ul>
            </div>

            <div className="mt-6">
              <div className="text-xs font-black text-white/60 uppercase tracking-widest">最容易翻车</div>
              <ul className="mt-3 space-y-2 text-sm text-white/75">
                {stage.pitfall.map((x: string) => <li key={x}>• {x}</li>)}
              </ul>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
              <span className="font-black text-white">提示：</span>{stage.tip}
            </div>
          </div>
        </div>
      </section>

      {/* Matrix */}
      <section className="rounded-[48px] border border-white/10 bg-white/[0.02] p-10 md:p-16">
        <div className="flex items-center gap-3 text-slate-400">
          <Briefcase className="text-indigo-400" />
          <h3 className="text-xl font-bold tracking-widest uppercase">CAREER × INDUSTRY MATRIX</h3>
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
                      <div className="mt-3 text-sm text-white/70 leading-relaxed">{c.summary}</div>
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

        <Modal open={!!picked} title={picked ? `${picked.role} × ${picked.industry}` : ""} onClose={() => setPicked(null)}>
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
                <div className="mt-3 text-sm text-white/70">优势向量：{formatTopTags(careerDev.topTags)}</div>
                <div className="mt-2 text-sm text-white/70">角色倾向：{formatTopRoles(careerDev.topRoles)}</div>
                <div className="mt-2 text-sm text-white/70">风险向量：{formatPitfalls(careerDev.pitfalls)}</div>
              </div>
            </div>
          ) : null}
        </Modal>
      </section>

      {/* RISK & RHYTHM + 三个建议 */}
      <section className="rounded-[48px] border border-white/10 bg-white/[0.02] p-10 md:p-16 space-y-10">
        <div className="flex items-center gap-3 text-slate-400">
          <Gauge className="text-indigo-400" />
          <h3 className="text-xl font-bold tracking-widest uppercase">RISK & RHYTHM</h3>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-8 rounded-[40px] bg-gradient-to-br from-slate-900 to-black border border-slate-800 p-10">
            <div className="flex flex-wrap gap-2">
              {(["冲锋期", "回收期", "修整期"] as const).map((x) => (
                <button
                  key={x}
                  onClick={() => setPhase(x)}
                  className={[
                    "px-5 py-2 rounded-2xl border text-sm font-black tracking-tight transition",
                    phase === x ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-200" : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10",
                  ].join(" ")}
                >
                  {x}
                </button>
              ))}
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/10 p-8">
                <div className="text-xs font-black uppercase tracking-widest text-emerald-200">✔ 建议做</div>
                <div className="mt-4">
                  <Chips items={rhythmAdvice.do} tone="good" />
                </div>
              </div>

              <div className="rounded-3xl border border-red-500/25 bg-red-500/10 p-8">
                <div className="text-xs font-black uppercase tracking-widest text-red-200">✖ 避免</div>
                <div className="mt-4">
                  <Chips items={rhythmAdvice.avoid} tone="bad" />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 rounded-[40px] bg-red-950/20 border border-red-500/30 p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert size={20} />
                <span className="font-bold uppercase tracking-widest text-xs">HARD RULE</span>
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

        {/* ✅ 三张建议：竖排 */}
        <div className="space-y-5">
          {actions.map((a) => (
            <ActionCard key={a.title} title={a.title} doList={a.doList} avoidList={a.avoidList} why={a.why} />
          ))}
        </div>
      </section>
    </div>
  );
}