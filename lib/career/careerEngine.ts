// src/lib/career/careerEngine.ts
import { explainPlacementImpact } from "@/lib/astroExplain";
import type { RoleId } from "@/lib/rolelibrary";

export type BodyKey =
  | "Sun" | "Moon" | "Mercury" | "Venus" | "Mars"
  | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto"
  | "ASC" | "MC" | "NorthNode" | "SouthNode";

export type SignZh =
  | "白羊" | "金牛" | "双子" | "巨蟹" | "狮子" | "处女"
  | "天秤" | "天蝎" | "射手" | "摩羯" | "水瓶" | "双鱼";

export type Placement = {
  body: BodyKey;
  sign: SignZh;
  house: number;     // 1..12
  degree?: number;   // 0..30（星座内度数）
  lon?: number;      // 0..360（可选）
};

export type CareerTag =
  | "Leadership"
  | "ManagementSystems"
  | "Strategy"
  | "Communication"
  | "ProductBuilder"
  | "ResearchDeepWork"
  | "PublicInfluence"
  | "CommunityNetwork"
  | "MoneyAssets"
  | "ServiceOps"
  | "Innovation"
  | "RiskFinance";

export type Evidence = {
  key: string;
  weight: number;
  tags: CareerTag[];
  text: string;
  source: { body: BodyKey; sign: SignZh; house: number; degree?: number };
};

export type ExplainItem = {
  body: BodyKey;
  sign: SignZh;
  house: number;
  degree?: number;
  text: string;
};

function clampHouse(h: number) {
  if (!Number.isFinite(h)) return 0;
  return Math.max(1, Math.min(12, Math.round(h)));
}

export function buildExplainItems(placements: Placement[]): ExplainItem[] {
  return placements.map((p) => {
    const exp = explainPlacementImpact({
      body: p.body,
      sign: p.sign,
      house: clampHouse(p.house),
      degree: p.degree,
    });
    return {
      body: p.body,
      sign: p.sign,
      house: clampHouse(p.house),
      degree: p.degree,
      text: exp.text,
    };
  });
}

export function buildCareerEvidence(placements: Placement[]): Evidence[] {
  const out: Evidence[] = [];
  const byBody = new Map<BodyKey, Placement>();
  for (const p of placements) byBody.set(p.body, { ...p, house: clampHouse(p.house) });

  const get = (b: BodyKey) => byBody.get(b);
  const push = (e: Evidence) => out.push(e);

  const mc = get("MC");
  if (mc) {
    push({
      key: "MC_PUBLIC",
      weight: 3.0,
      tags: ["PublicInfluence", "Leadership", "Strategy"],
      text: `MC 事业主轴强化：更容易在事业/名声议题被看见与评价。`,
      source: { body: "MC", sign: mc.sign, house: mc.house, degree: mc.degree },
    });
  }

  for (const p of placements.filter((x) => clampHouse(x.house) === 2)) {
    push({
      key: `H2_${p.body}`,
      weight: 2.0,
      tags: ["MoneyAssets"],
      text: `${p.body} 落第2宫：资源、价值、定价与积累主题增强。`,
      source: { body: p.body, sign: p.sign, house: 2, degree: p.degree },
    });
  }

  for (const p of placements.filter((x) => clampHouse(x.house) === 6)) {
    push({
      key: `H6_${p.body}`,
      weight: 1.8,
      tags: ["ServiceOps", "ManagementSystems"],
      text: `${p.body} 落第6宫：流程、习惯、运营与稳定产出增强。`,
      source: { body: p.body, sign: p.sign, house: 6, degree: p.degree },
    });
  }

  for (const p of placements.filter((x) => clampHouse(x.house) === 8)) {
    push({
      key: `H8_${p.body}`,
      weight: 2.2,
      tags: ["RiskFinance", "MoneyAssets", "ResearchDeepWork"],
      text: `${p.body} 落第8宫：共享资源/高风险金融/深水区博弈主题增强。`,
      source: { body: p.body, sign: p.sign, house: 8, degree: p.degree },
    });
  }

  for (const p of placements.filter((x) => clampHouse(x.house) === 11)) {
    push({
      key: `H11_${p.body}`,
      weight: 2.0,
      tags: ["CommunityNetwork", "PublicInfluence"],
      text: `${p.body} 落第11宫：社群、人脉、平台与资源放大主题增强。`,
      source: { body: p.body, sign: p.sign, house: 11, degree: p.degree },
    });
  }

  for (const p of placements.filter((x) => [3, 9].includes(clampHouse(x.house)))) {
    push({
      key: `H${clampHouse(p.house)}_${p.body}`,
      weight: 1.6,
      tags: clampHouse(p.house) === 3 ? ["Communication"] : ["Strategy", "Communication"],
      text: `${p.body} 落第${clampHouse(p.house)}宫：学习/表达/框架化能力更易成为职业武器。`,
      source: { body: p.body, sign: p.sign, house: clampHouse(p.house), degree: p.degree },
    });
  }

  const sun = get("Sun");
  if (sun) {
    push({
      key: "SUN_CORE",
      weight: 1.8,
      tags: ["Leadership"],
      text: `太阳：主轴/成就感（偏承担主责与主线）。`,
      source: { body: "Sun", sign: sun.sign, house: sun.house, degree: sun.degree },
    });
  }

  const mercury = get("Mercury");
  if (mercury) {
    push({
      key: "MERCURY_COMM",
      weight: 1.7,
      tags: ["Communication", "ResearchDeepWork"],
      text: `水星：思维/沟通/学习（信息处理与表达）。`,
      source: { body: "Mercury", sign: mercury.sign, house: mercury.house, degree: mercury.degree },
    });
  }

  const mars = get("Mars");
  if (mars) {
    push({
      key: "MARS_ACTION",
      weight: 1.8,
      tags: ["Leadership", "Innovation"],
      text: `火星：行动/冲突（推进力、竞争、边界）。`,
      source: { body: "Mars", sign: mars.sign, house: mars.house, degree: mars.degree },
    });
  }

  const saturn = get("Saturn");
  if (saturn) {
    push({
      key: "SATURN_SYSTEM",
      weight: 1.9,
      tags: ["ManagementSystems", "ServiceOps", "Strategy"],
      text: `土星：长期结构与复利训练（责任/规则/可持续）。`,
      source: { body: "Saturn", sign: saturn.sign, house: saturn.house, degree: saturn.degree },
    });
  }

  const uranus = get("Uranus");
  if (uranus) {
    push({
      key: "URANUS_INNOV",
      weight: 1.6,
      tags: ["Innovation", "CommunityNetwork"],
      text: `天王星：创新/非典型路径（更新规则与玩法）。`,
      source: { body: "Uranus", sign: uranus.sign, house: uranus.house, degree: uranus.degree },
    });
  }

  const pluto = get("Pluto");
  if (pluto) {
    push({
      key: "PLUTO_DEPTH",
      weight: 1.6,
      tags: ["ResearchDeepWork", "RiskFinance"],
      text: `冥王星：深度转化（深水区、极端体验、重启）。`,
      source: { body: "Pluto", sign: pluto.sign, house: pluto.house, degree: pluto.degree },
    });
  }

  const elementOf: Record<SignZh, "Fire" | "Earth" | "Air" | "Water"> = {
    白羊: "Fire", 狮子: "Fire", 射手: "Fire",
    金牛: "Earth", 处女: "Earth", 摩羯: "Earth",
    双子: "Air", 天秤: "Air", 水瓶: "Air",
    巨蟹: "Water", 天蝎: "Water", 双鱼: "Water",
  };

  for (const p of placements) {
    const el = elementOf[p.sign];
    if (el === "Fire") {
      push({
        key: `EL_FIRE_${p.body}`,
        weight: 0.6,
        tags: ["Innovation", "Leadership"],
        text: `${p.body} 在火象：更偏主动突破、快节奏与进攻决策。`,
        source: { body: p.body, sign: p.sign, house: clampHouse(p.house), degree: p.degree },
      });
    } else if (el === "Earth") {
      push({
        key: `EL_EARTH_${p.body}`,
        weight: 0.6,
        tags: ["ManagementSystems", "ServiceOps", "MoneyAssets"],
        text: `${p.body} 在土象：更偏结构、复利、落地与长期积累。`,
        source: { body: p.body, sign: p.sign, house: clampHouse(p.house), degree: p.degree },
      });
    } else if (el === "Air") {
      push({
        key: `EL_AIR_${p.body}`,
        weight: 0.6,
        tags: ["Communication", "CommunityNetwork"],
        text: `${p.body} 在风象：更偏信息、表达、连接与网络效应。`,
        source: { body: p.body, sign: p.sign, house: clampHouse(p.house), degree: p.degree },
      });
    } else {
      push({
        key: `EL_WATER_${p.body}`,
        weight: 0.6,
        tags: ["ResearchDeepWork", "RiskFinance"],
        text: `${p.body} 在水象：更偏深度、洞察、隐性动机与共情。`,
        source: { body: p.body, sign: p.sign, house: clampHouse(p.house), degree: p.degree },
      });
    }
  }

  return out;
}

export type TagScore = { tag: CareerTag; score: number };
export function scoreTags(evidence: Evidence[]): TagScore[] {
  const m = new Map<CareerTag, number>();
  for (const e of evidence) for (const t of e.tags) m.set(t, (m.get(t) || 0) + e.weight);
  return [...m.entries()].map(([tag, score]) => ({ tag, score })).sort((a, b) => b.score - a.score);
}

export type RoleScore = { role: RoleId; score: number };

const ROLE_TAG_WEIGHTS: Record<RoleId, Partial<Record<CareerTag, number>>> = {
  SYSTEM_ARCHITECT: { ManagementSystems: 2.0, Strategy: 1.6, ResearchDeepWork: 1.2, Leadership: 1.0 },
  RESEARCH_STRATEGIST: { ResearchDeepWork: 2.2, Strategy: 1.4, Communication: 0.8 },
  CONNECTOR_BD: { CommunityNetwork: 2.2, PublicInfluence: 1.3, Communication: 1.2, Leadership: 0.7 },
  GROWTH_MARKETER: { Communication: 1.8, CommunityNetwork: 1.4, Innovation: 1.2, PublicInfluence: 1.0 },
  SALES_CLOSER: {},
  EDUCATOR_MENTOR: {},
  BIZOPS_MONETIZATION: { MoneyAssets: 2.2, ManagementSystems: 1.2, Strategy: 1.0 },
  PRODUCT_DESIGN: { ProductBuilder: 2.0, ResearchDeepWork: 1.0, Communication: 0.9 },
  COMMUNITY_OPERATOR: { CommunityNetwork: 2.2, ServiceOps: 1.2, Communication: 1.0 },
  PM_DELIVERY: { ManagementSystems: 1.8, ServiceOps: 1.6, Communication: 0.8 },
  DATA_ANALYST: { ResearchDeepWork: 2.0, Strategy: 1.0, ManagementSystems: 0.8 },
  RISK_COMPLIANCE: { ManagementSystems: 1.6, ResearchDeepWork: 1.2, Strategy: 1.0 },

  BUILDER_FOUNDER: { Innovation: 1.8, Leadership: 1.5, ProductBuilder: 1.3, Strategy: 0.8 },
  NARRATIVE_CREATOR: { Communication: 2.0, PublicInfluence: 1.6, Innovation: 1.0 },
  ALLOCATOR_PORTFOLIO: { Strategy: 2.0, MoneyAssets: 1.6, RiskFinance: 1.2, ResearchDeepWork: 0.8 },
  PEOPLE_CULTURE: { ServiceOps: 1.4, Communication: 1.2, ManagementSystems: 1.0 },
};

export function scoreRoles(tagScores: TagScore[]): RoleScore[] {
  const tagMap = new Map<CareerTag, number>(tagScores.map((t) => [t.tag, t.score]));
  const roles = Object.keys(ROLE_TAG_WEIGHTS) as RoleId[];
  const out: RoleScore[] = [];

  for (const role of roles) {
    let s = 0;
    const w = ROLE_TAG_WEIGHTS[role] || {};
    for (const [tag, base] of tagMap.entries()) {
      const k = w[tag] || 0;
      if (k) s += k * base;
    }
    out.push({ role, score: s });
  }
  return out.sort((a, b) => b.score - a.score);
}

export type CareerDevelopmentOutput = {
  evidence: Evidence[];
  tagScores: TagScore[];
  roleScores: RoleScore[];

  topRoles: RoleScore[];
  topTags: TagScore[];

  careerArchetype: "EXECUTION_SYSTEM" | "STRATEGY_RESEARCH" | "NETWORK_INFLUENCE" | "RISK_FINANCE" | "INNOVATION_BUILD";
  investmentArchetype: "COMPOUND_STRUCTURAL" | "NARRATIVE_ATTACK" | "RESEARCH_ARBITRAGE" | "EMOTION_CYCLE";

  pitfalls: Array<{ key: string; weight: number; fromTags: CareerTag[] }>;
};

function topN<T>(arr: T[], n: number) {
  return arr.slice(0, Math.max(0, n));
}
function tagOf(tagScores: TagScore[], tag: CareerTag) {
  return tagScores.find((t) => t.tag === tag)?.score || 0;
}

export function computeCareerDevelopment(placements: Placement[]): CareerDevelopmentOutput {
  const evidence = buildCareerEvidence(placements);
  const tagScores = scoreTags(evidence);
  const roleScores = scoreRoles(tagScores);

  const topRoles = topN(roleScores, 5);
  const topTags = topN(tagScores, 6);

  const sLeadership = tagOf(tagScores, "Leadership");
  const sMgmt = tagOf(tagScores, "ManagementSystems");
  const sStrategy = tagOf(tagScores, "Strategy");
  const sComm = tagOf(tagScores, "Communication");
  const sResearch = tagOf(tagScores, "ResearchDeepWork");
  const sPublic = tagOf(tagScores, "PublicInfluence");
  const sNetwork = tagOf(tagScores, "CommunityNetwork");
  const sMoney = tagOf(tagScores, "MoneyAssets");
  const sRisk = tagOf(tagScores, "RiskFinance");
  const sInnov = tagOf(tagScores, "Innovation");
  const sService = tagOf(tagScores, "ServiceOps");
  const sProduct = tagOf(tagScores, "ProductBuilder");

  const buckets = [
    { k: "EXECUTION_SYSTEM" as const, v: sMgmt + sService },
    { k: "STRATEGY_RESEARCH" as const, v: sStrategy + sResearch },
    { k: "NETWORK_INFLUENCE" as const, v: sComm + sNetwork + sPublic },
    { k: "RISK_FINANCE" as const, v: sMoney + sRisk },
    { k: "INNOVATION_BUILD" as const, v: sInnov + sLeadership + sProduct },
  ].sort((a, b) => b.v - a.v);

  const careerArchetype = buckets[0].k;

  const invBuckets = [
    { k: "COMPOUND_STRUCTURAL" as const, v: sMgmt + sMoney + sService },
    { k: "NARRATIVE_ATTACK" as const, v: sInnov + sLeadership + sPublic },
    { k: "RESEARCH_ARBITRAGE" as const, v: sResearch + sStrategy + sComm },
    { k: "EMOTION_CYCLE" as const, v: sRisk + (sPublic * 0.3) - (sMgmt * 0.4) },
  ].sort((a, b) => b.v - a.v);

  const investmentArchetype = invBuckets[0].k;

  const pitfalls: CareerDevelopmentOutput["pitfalls"] = [];
  const p1 = sRisk - sMgmt * 0.6 - sService * 0.4;
  if (p1 > 2.5) pitfalls.push({ key: "RISK_OVERLOAD_LOW_SYSTEM", weight: p1, fromTags: ["RiskFinance", "MoneyAssets", "Innovation"] });

  const p2 = (sPublic + sNetwork) - (sMgmt * 0.7 + sService * 0.5);
  if (p2 > 3.0) pitfalls.push({ key: "RELATIONSHIP_DRAIN", weight: p2, fromTags: ["CommunityNetwork", "PublicInfluence", "Communication"] });

  const p3 = (sResearch + sStrategy) - (sLeadership * 0.8 + sInnov * 0.6);
  if (p3 > 3.0) pitfalls.push({ key: "ANALYSIS_PARALYSIS", weight: p3, fromTags: ["ResearchDeepWork", "Strategy"] });

  const p4 = (sMgmt + sService) - (sInnov * 0.8 + sPublic * 0.4);
  if (p4 > 3.0) pitfalls.push({ key: "STABLE_NO_BREAKOUT", weight: p4, fromTags: ["ManagementSystems", "ServiceOps"] });

  pitfalls.sort((a, b) => b.weight - a.weight);

  return { evidence, tagScores, roleScores, topRoles, topTags, careerArchetype, investmentArchetype, pitfalls };
}
// ✅ Debug Trace 类型（新增）
export type CareerDebugTrace = {
  inputs: {
    placements: Placement[];
  };
  evidence: Evidence[];
  tagScores: TagScore[];
  roleScores: RoleScore[];
  archetypeBuckets: Array<{ key: CareerDevelopmentOutput["careerArchetype"]; value: number }>;
  investmentBuckets: Array<{ key: CareerDevelopmentOutput["investmentArchetype"]; value: number }>;
  pitfallRaw: Array<{ key: string; value: number; fromTags: CareerTag[] }>;
  output: Pick<CareerDevelopmentOutput, "careerArchetype" | "investmentArchetype" | "topTags" | "topRoles" | "pitfalls">;
};

// ✅ 新增：带 trace 的计算（不改原函数签名）
export function computeCareerDevelopmentWithTrace(
  placements: Placement[]
): { output: CareerDevelopmentOutput; trace: CareerDebugTrace } {
  const evidence = buildCareerEvidence(placements);
  const tagScores = scoreTags(evidence);
  const roleScores = scoreRoles(tagScores);

  const topRoles = roleScores.slice(0, 5);
  const topTags = tagScores.slice(0, 6);

  const tagOf = (tag: CareerTag) => tagScores.find((t) => t.tag === tag)?.score || 0;

  const sLeadership = tagOf("Leadership");
  const sMgmt = tagOf("ManagementSystems");
  const sStrategy = tagOf("Strategy");
  const sComm = tagOf("Communication");
  const sResearch = tagOf("ResearchDeepWork");
  const sPublic = tagOf("PublicInfluence");
  const sNetwork = tagOf("CommunityNetwork");
  const sMoney = tagOf("MoneyAssets");
  const sRisk = tagOf("RiskFinance");
  const sInnov = tagOf("Innovation");
  const sService = tagOf("ServiceOps");
  const sProduct = tagOf("ProductBuilder");

  const archetypeBuckets = [
    { key: "EXECUTION_SYSTEM" as const, value: sMgmt + sService },
    { key: "STRATEGY_RESEARCH" as const, value: sStrategy + sResearch },
    { key: "NETWORK_INFLUENCE" as const, value: sComm + sNetwork + sPublic },
    { key: "RISK_FINANCE" as const, value: sMoney + sRisk },
    { key: "INNOVATION_BUILD" as const, value: sInnov + sLeadership + sProduct },
  ].sort((a, b) => b.value - a.value);

  const careerArchetype = archetypeBuckets[0].key;

  const investmentBuckets = [
    { key: "COMPOUND_STRUCTURAL" as const, value: sMgmt + sMoney + sService },
    { key: "NARRATIVE_ATTACK" as const, value: sInnov + sLeadership + sPublic },
    { key: "RESEARCH_ARBITRAGE" as const, value: sResearch + sStrategy + sComm },
    { key: "EMOTION_CYCLE" as const, value: sRisk + sPublic * 0.3 - sMgmt * 0.4 },
  ].sort((a, b) => b.value - a.value);

  const investmentArchetype = investmentBuckets[0].key;

  // pitfalls raw
  const pitfallRaw: CareerDebugTrace["pitfallRaw"] = [];
  const p1 = sRisk - sMgmt * 0.6 - sService * 0.4;
  if (p1 > 2.5) pitfallRaw.push({ key: "RISK_OVERLOAD_LOW_SYSTEM", value: p1, fromTags: ["RiskFinance", "MoneyAssets", "Innovation"] });

  const p2 = (sPublic + sNetwork) - (sMgmt * 0.7 + sService * 0.5);
  if (p2 > 3.0) pitfallRaw.push({ key: "RELATIONSHIP_DRAIN", value: p2, fromTags: ["CommunityNetwork", "PublicInfluence", "Communication"] });

  const p3 = (sResearch + sStrategy) - (sLeadership * 0.8 + sInnov * 0.6);
  if (p3 > 3.0) pitfallRaw.push({ key: "ANALYSIS_PARALYSIS", value: p3, fromTags: ["ResearchDeepWork", "Strategy"] });

  const p4 = (sMgmt + sService) - (sInnov * 0.8 + sPublic * 0.4);
  if (p4 > 3.0) pitfallRaw.push({ key: "STABLE_NO_BREAKOUT", value: p4, fromTags: ["ManagementSystems", "ServiceOps"] });

  pitfallRaw.sort((a, b) => b.value - a.value);

  const pitfalls = pitfallRaw.map((x) => ({ key: x.key, weight: x.value, fromTags: x.fromTags }));

  const output: CareerDevelopmentOutput = {
    evidence,
    tagScores,
    roleScores,
    topRoles,
    topTags,
    careerArchetype,
    investmentArchetype,
    pitfalls,
  };

  const trace: CareerDebugTrace = {
    inputs: { placements },
    evidence,
    tagScores,
    roleScores,
    archetypeBuckets,
    investmentBuckets,
    pitfallRaw,
    output: { careerArchetype, investmentArchetype, topTags, topRoles, pitfalls },
  };

  return { output, trace };
}