// src/lib/career/domainEngine.ts
import type { Placement, BodyKey, SignZh } from "@/lib/career/careerEngine";
import type { CareerTag, CareerDomain, DomainResult, DomainScore } from "./domainTypes";
import { DOMAIN_LIBRARY } from "./domainLibrary";

// ---------- 基础工具 ----------
function add(m: Record<string, number>, k: string, v: number) {
  m[k] = (m[k] || 0) + v;
}
function clampHouse(h: number) {
  return Math.max(1, Math.min(12, Math.round(h)));
}

const FIRE: SignZh[] = ["白羊", "狮子", "射手"];
const EARTH: SignZh[] = ["金牛", "处女", "摩羯"];
const AIR: SignZh[] = ["双子", "天秤", "水瓶"];
const WATER: SignZh[] = ["巨蟹", "天蝎", "双鱼"];

function elementOf(sign: SignZh) {
  if (FIRE.includes(sign)) return "FIRE";
  if (EARTH.includes(sign)) return "EARTH";
  if (AIR.includes(sign)) return "AIR";
  return "WATER";
}

// ---------- 1) 星盘 → Tag 向量 ----------
export function buildTagVector(placements: Placement[]) {
    const tag: Record<CareerTag, number> = {
        ResearchDeepWork: 0,
        MathLogic: 0,
        Engineering: 0,
        Systems: 0,
        Communication: 0,
        Storytelling: 0,
        Aesthetics: 0,
        EmpathyCare: 0,
        Leadership: 0,
        PublicInfluence: 0,
        CommunityNetwork: 0,
        MoneyAssets: 0,
        RiskFinance: 0,
        LawCompliance: 0,
        TeachingMentoring: 0,
        Operations: 0,
        Innovation: 0,
        Strategy: 0,
      };
      

  const reasons: string[] = [];

  const byBody = new Map<BodyKey, Placement>();
  placements.forEach((p) => byBody.set(p.body, { ...p, house: clampHouse(p.house) }));

  const sun = byBody.get("Sun");
  const moon = byBody.get("Moon");
  const mercury = byBody.get("Mercury");
  const venus = byBody.get("Venus");
  const mars = byBody.get("Mars");
  const jupiter = byBody.get("Jupiter");
  const saturn = byBody.get("Saturn");
  const uranus = byBody.get("Uranus");
  const neptune = byBody.get("Neptune");
  const pluto = byBody.get("Pluto");
  const asc = byBody.get("ASC");
  const mc = byBody.get("MC");

  // --- 宫位是“主题域”的强信号 ---
  for (const p of placements) {
    const h = clampHouse(p.house);

    if (h === 3) { add(tag, "Communication", 1.2); reasons.push(`${p.body} 落 3 宫：沟通/学习/写作增强`); }
    if (h === 5) { add(tag, "Aesthetics", 1.2); add(tag, "Storytelling", 0.8); reasons.push(`${p.body} 落 5 宫：创作/表达/舞台感增强`); }
    if (h === 6) { add(tag, "Systems", 1.0); add(tag, "Operations", 1.0); reasons.push(`${p.body} 落 6 宫：流程/执行/日常系统增强`); }
    if (h === 8) { add(tag, "RiskFinance", 1.2); add(tag, "ResearchDeepWork", 0.6); reasons.push(`${p.body} 落 8 宫：深水区/金融博弈/风控意识增强`); }
    if (h === 9) { add(tag, "ResearchDeepWork", 1.0); add(tag, "TeachingMentoring", 0.6); add(tag, "Strategy", 0.8 as any); reasons.push(`${p.body} 落 9 宫：高等学习/世界观/研究增强`); }
    if (h === 10) { add(tag, "PublicInfluence", 1.2); add(tag, "Leadership", 0.8); reasons.push(`${p.body} 落 10 宫：事业/公众形象/权威增强`); }
    if (h === 11) { add(tag, "CommunityNetwork", 1.2); add(tag, "PublicInfluence", 0.6); reasons.push(`${p.body} 落 11 宫：社群/平台/网络效应增强`); }
    if (h === 12) { add(tag, "EmpathyCare", 0.8); add(tag, "ResearchDeepWork", 0.6); reasons.push(`${p.body} 落 12 宫：共情/疗愈/潜意识深度增强`); }
    if (h === 2) { add(tag, "MoneyAssets", 1.2); reasons.push(`${p.body} 落 2 宫：资源/价值/定价增强`); }
  }

  // --- 行星是“能力模块”的强信号 ---
  if (mercury) {
    add(tag, "Communication", 1.2);
    add(tag, "MathLogic", 0.6);
    reasons.push(`水星：思维与表达能力加成`);
    if (AIR.includes(mercury.sign)) { add(tag, "Communication", 0.8); reasons.push(`水星风象：信息处理/表达更强`); }
    if (EARTH.includes(mercury.sign)) { add(tag, "Systems", 0.6); reasons.push(`水星土象：结构化/流程化表达更强`); }
  }

  if (venus) {
    add(tag, "Aesthetics", 1.0);
    add(tag, "EmpathyCare", 0.4);
    reasons.push(`金星：审美/关系/价值感加成`);
  }

  if (mars) {
    add(tag, "Leadership", 0.8);
    add(tag, "Engineering", 0.6);
    reasons.push(`火星：行动力/推进力加成`);
    if (FIRE.includes(mars.sign)) { add(tag, "Leadership", 0.6); add(tag, "Innovation", 0.6); reasons.push(`火星火象：进攻性与突破性更强`); }
  }

  if (saturn) {
    add(tag, "Systems", 1.2);
    add(tag, "LawCompliance", 0.6);
    reasons.push(`土星：规则/纪律/长期结构加成`);
    if (EARTH.includes(saturn.sign)) { add(tag, "Systems", 0.8); reasons.push(`土星土象：长期主义与结果导向更强`); }
  }

  if (uranus) {
    add(tag, "Innovation", 1.2);
    add(tag, "Engineering", 0.4);
    reasons.push(`天王星：创新/非典型路径加成`);
  }

  if (neptune) {
    add(tag, "Storytelling", 1.0);
    add(tag, "Aesthetics", 0.6);
    add(tag, "EmpathyCare", 0.6);
    reasons.push(`海王星：灵感/艺术/共情加成`);
  }

  if (pluto) {
    add(tag, "ResearchDeepWork", 1.2);
    add(tag, "RiskFinance", 0.6);
    reasons.push(`冥王星：深度洞察/极端议题处理加成`);
  }

  if (jupiter) {
    add(tag, "Strategy", 0.8 as any);
    add(tag, "PublicInfluence", 0.6);
    add(tag, "TeachingMentoring", 0.4);
    reasons.push(`木星：扩张/视野/机会加成`);
  }

  if (mc) {
    add(tag, "PublicInfluence", 1.0);
    add(tag, "Leadership", 0.6);
    reasons.push(`MC：事业主轴/社会角色加成`);
  }

  if (asc) {
    // 上升更多影响“做事风格”
    const el = elementOf(asc.sign);
    if (el === "EARTH") { add(tag, "Systems", 0.6); reasons.push(`上升土象：更偏稳健/结构化推进`); }
    if (el === "AIR") { add(tag, "Communication", 0.6); reasons.push(`上升风象：更偏沟通/连接`); }
    if (el === "FIRE") { add(tag, "Leadership", 0.6); reasons.push(`上升火象：更偏主动/冲锋`); }
    if (el === "WATER") { add(tag, "EmpathyCare", 0.6); reasons.push(`上升水象：更偏共情/感受`); }
  }

  return { tagVector: tag, tagReasons: reasons };
}

// ---------- 2) Tag 向量 → Domain/Track 得分 ----------
export function inferCareerDomainsFromPlacements(placements: Placement[]): DomainResult {
  const { tagVector, tagReasons } = buildTagVector(placements);

  const domainScores: DomainScore[] = (Object.keys(DOMAIN_LIBRARY) as CareerDomain[]).map((domain) => {
    const def = DOMAIN_LIBRARY[domain];

    let score = 0;
    const reasons: string[] = [];

    // domain score
    for (const [k, w] of Object.entries(def.weights)) {
      const tag = k as keyof typeof tagVector;
      const weight = w || 0;
      const base = (tagVector as any)[tag] || 0;
      if (weight !== 0 && base !== 0) {
        score += base * weight;
      }
    }

    // pick top tag reasons（解释用）
    const topTags = Object.entries(def.weights)
      .map(([t, w]) => ({ t: t as CareerTag, w: w || 0, v: (tagVector as any)[t] || 0, s: ((tagVector as any)[t] || 0) * (w || 0) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3);

    topTags.forEach((x) => {
      if (x.s > 0) reasons.push(`命中「${tZh(x.t)}」×权重(${x.w})`);
    });

    // tracks
    const tracks = def.tracks.map((tr) => {
      let ts = 0;
      const trReasons: string[] = [];
      for (const [k, w] of Object.entries(tr.weights)) {
        const base = (tagVector as any)[k] || 0;
        const weight = w || 0;
        ts += base * weight;
      }
      const top = Object.entries(tr.weights)
        .map(([t, w]) => ({ t: t as CareerTag, s: ((tagVector as any)[t] || 0) * (w || 0) }))
        .sort((a, b) => b.s - a.s)
        .slice(0, 2);
      top.forEach((x) => { if (x.s > 0) trReasons.push(`偏向「${tZh(x.t)}」`); });
      return { name: tr.name, score: ts, reasons: trReasons };
    }).sort((a, b) => b.score - a.score);

    // 合并一个“来源解释”：tagReasons 只作为补充，不全部塞 UI
    if (tagReasons.length) reasons.push(`星盘证据：${tagReasons.slice(0, 3).join("；")}`);

    return { domain, score, reasons, tracks };
  }).sort((a, b) => b.score - a.score);

  return {
    tagVector,
    domainScores,
    topDomains: domainScores.slice(0, 3),
  };
}

function tZh(t: CareerTag) {
  const map: Record<CareerTag, string> = {
    ResearchDeepWork: "研究/深度洞察",
    MathLogic: "数理逻辑",
    Engineering: "工程实现",
    Systems: "系统/流程",
    Strategy: "战略决策", // ← 修复：添加缺失的 Strategy 字段
    Communication: "表达传播",
    Storytelling: "叙事内容",
    Aesthetics: "审美艺术",
    EmpathyCare: "共情照护",
    Leadership: "领导决策",
    PublicInfluence: "公众影响力",
    CommunityNetwork: "社群人脉",
    MoneyAssets: "金钱资产",
    RiskFinance: "风险金融",
    LawCompliance: "法律合规",
    TeachingMentoring: "教学辅导",
    Operations: "运营执行",
    Innovation: "创新破局",
  };
  return map[t];
}
