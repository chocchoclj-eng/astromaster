// lib/scoring/engine.ts
import scoringConfig from "./scoring.config.v1.json";

type PlanetRow = {
  body: string;        // "Sun" | ... | "NorthNode" | "ASC" | ...
  lon: number;         // 0..360
  sign: string;        // 中文：白羊/金牛...
  house: number;       // 1..12
  deg?: number;
  min?: number;
};

type KeyConfig = {
  coreFull?: {
    planets?: PlanetRow[];
    houses?: number[];
  };
  raw?: any; // chart raw from sweph in your code
};

type TraitKey =
  | "DecisionSpeed" | "DecisionConfidence" | "AnalyticalDepth" | "SystemsThinking"
  | "ExecutionDrive" | "Adaptability" | "DisciplineRoutine"
  | "EmotionalSensitivity" | "EmotionalRegulation" | "StressTolerance" | "RecoveryNeed"
  | "SelfTrust" | "MeaningDrive"
  | "AttachmentSecurityNeed" | "ReciprocityFairness" | "BoundaryStrength"
  | "WarmthNurturance" | "InfluenceNegotiation"
  | "RiskAppetite" | "RiskControl" | "ValueStability" | "PowerIntensityDrive";

type DomainKey = "Love" | "Friendship" | "Family" | "Career" | "Investment" | "Resilience";

type AspectType = "conj" | "sextile" | "square" | "trine" | "opposition";

type Aspect = {
  a: string;          // body name
  b: string;          // body name
  type: AspectType;
  orb: number;        // degrees
  weight: number;     // w(type,orb)
  delta: number;      // angle distance
};

type EvidenceItem = {
  source: string;     // e.g. "Sun(巨蟹/4宫)"
  value: number;      // contribution value
  detail?: any;
};

type PlanetContrib = {
  body: string;
  sign: string;
  house: number;
  pw: number;
  rel: number;
  signAdj: number;
  houseAct: number;
  rep: number;
  contrib: number;
};

type AspectContrib = {
  a: string;
  b: string;
  type: AspectType;
  orb: number;
  weight: number;
  pairEffect: number;
  sign: number;
  contrib: number;
};

type TraitEvidence = {
  topPlanets: EvidenceItem[];
  topAspects: EvidenceItem[];
  raw: number;
  score: number;

  // ✅ trace: 完整拆解（ScorePanel 依赖）
  planetContribs?: PlanetContrib[];
  aspectContribs?: AspectContrib[];
  normalization?: {
    method: string;
    formula: string;
    detail?: string;
    mean?: number;
    std?: number;
    k?: number;
  };
};

type DomainEvidence = {
  domain: DomainKey;
  base: number;
  num: number;
  den: number;
  lambda: number;
  calibrated: number;
  sceneFactor: number;
  scriptFactor: number;
  value: number;
  trigger: number;
  traitsUsed: {
    traitKey: TraitKey;
    weight: number;
    traitScore: number;
    contrib: number; // traitScore * weight
  }[];
};

export type ScoreResult = {
  traits: Record<TraitKey, number>;
  traits_raw: Record<TraitKey, number>;
  nsv: Record<string, number>;
  domains: Record<DomainKey, number>;
  evidence: {
    traits: Record<TraitKey, TraitEvidence>;
    aspects: Aspect[];
    repetition: { house: number; bodies: string[]; factor: number }[];
    normalization?: {
      method: string;
      detail?: string;
    };
    domains?: Record<DomainKey, DomainEvidence>;
  };
};

function clamp(x: number, a = 0, b = 100) {
  return Math.max(a, Math.min(b, x));
}
function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}
function norm360(x: number) {
  return ((x % 360) + 360) % 360;
}
function angleDistance(a: number, b: number) {
  const d = Math.abs(norm360(a) - norm360(b));
  return Math.min(d, 360 - d);
}
function getConfig() {
  return scoringConfig as any;
}

/** 从 keyConfig 取 planet 列表（兼容你 route.ts 的结构） */
function extractPlanets(keyConfig: KeyConfig): PlanetRow[] {
  const planets = (keyConfig?.coreFull?.planets || []).filter(
    (p) => Number.isFinite(p.lon) && p.house >= 1 && p.house <= 12
  );

  if (planets.length) return planets;

  const raw = keyConfig?.raw;
  const b = raw?.bodies || {};
  const list: PlanetRow[] = [];
  const push = (body: string, src: any) => {
    if (!src || !Number.isFinite(Number(src.lon))) return;
    list.push({
      body,
      lon: Number(src.lon),
      sign: "—",
      house: Number(src.house || 0),
      deg: src.deg,
      min: src.min,
    });
  };

  push("Sun", b.Sun);
  push("Moon", b.Moon);
  push("Mercury", b.Mercury);
  push("Venus", b.Venus);
  push("Mars", b.Mars);
  push("Jupiter", b.Jupiter);
  push("Saturn", b.Saturn);
  push("Uranus", b.Uranus);
  push("Neptune", b.Neptune);
  push("Pluto", b.Pluto);
  push("NorthNode", b.TrueNode_North || b.NorthNode);
  push("SouthNode", b.TrueNode_South || b.SouthNode);

  if (Number.isFinite(raw?.angles?.ASC)) list.push({ body: "ASC", lon: raw.angles.ASC, sign: "—", house: 1 });
  if (Number.isFinite(raw?.angles?.MC)) list.push({ body: "MC", lon: raw.angles.MC, sign: "—", house: 10 });

  return list;
}

const TRAIT_BODIES = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
const isTraitBody = (b: string) => TRAIT_BODIES.includes(b);

/** 计算 SEV(sign)：中文星座 -> signKey -> element/mode/polarity -> 向量相加 */
function computeSEV(signZh: string) {
  const cfg = getConfig();
  const map = cfg.sev_signEnergyVector.signNameToKey || {};
  const signKey = map[signZh] || null;
  if (!signKey) {
    return { initiative: 0, stability: 0, abstraction: 0, intensity: 0 };
  }
  const meta = cfg.sev_signEnergyVector.signMeta[signKey];
  const eV = cfg.sev_signEnergyVector.elementVector[meta.element];
  const mV = cfg.sev_signEnergyVector.modeVector[meta.mode];
  const pV = cfg.sev_signEnergyVector.polarityVector[meta.polarity];

  return {
    initiative: (eV.initiative || 0) + (mV.initiative || 0) + (pV.initiative || 0),
    stability: (eV.stability || 0) + (mV.stability || 0) + (pV.stability || 0),
    abstraction: (eV.abstraction || 0) + (mV.abstraction || 0) + (pV.abstraction || 0),
    intensity: (eV.intensity || 0) + (mV.intensity || 0) + (pV.intensity || 0),
  };
}

/** SignAdj = clamp(alpha·SEV, -0.15, +0.15) */
function computeSignAdj(
  trait: TraitKey,
  sev: { initiative: number; stability: number; abstraction: number; intensity: number }
) {
  const cfg = getConfig();
  const alpha = cfg.A2_alpha_TraitToSEV.alpha[trait] as number[] | undefined;
  const clampCfg = cfg.A2_alpha_TraitToSEV.clamp || { min: -0.15, max: 0.15 };
  if (!alpha || alpha.length !== 4) return 0;

  const dot =
    alpha[0] * (sev.initiative || 0) +
    alpha[1] * (sev.stability || 0) +
    alpha[2] * (sev.abstraction || 0) +
    alpha[3] * (sev.intensity || 0);

  return Math.max(clampCfg.min, Math.min(clampCfg.max, dot));
}

/** repetitionFactor：同宫>=minCount 的点位贡献乘factor */
function computeRepetition(planets: PlanetRow[]) {
  const cfg = getConfig();
  const rep = cfg.weights.repetitionFactor;
  if (!rep?.enabled) return { factorByBody: new Map<string, number>(), detail: [] as any[] };

  const include = new Set<string>(rep.includeBodies || []);
  const byHouse = new Map<number, string[]>();
  for (const p of planets) {
    if (!include.has(p.body)) continue;
    const arr = byHouse.get(p.house) || [];
    arr.push(p.body);
    byHouse.set(p.house, arr);
  }

  const factorByBody = new Map<string, number>();
  const detail: { house: number; bodies: string[]; factor: number }[] = [];

  for (const [house, bodies] of byHouse.entries()) {
    if (bodies.length >= (rep.minCountInHouse || 2)) {
      for (const b of bodies) factorByBody.set(b, rep.factor || 1.25);
      detail.push({ house, bodies, factor: rep.factor || 1.25 });
    }
  }

  return { factorByBody, detail };
}

/** 相位计算（B1~B4） */
function computeAspects(planets: PlanetRow[]): Aspect[] {
  const cfg = getConfig();
  const aspCfg = cfg.B_aspects;
  if (!aspCfg?.enabled) return [];

  const include = new Set<string>(aspCfg.includeBodies || []);
  const P = planets.filter((p) => include.has(p.body) && Number.isFinite(p.lon));

  const allowed = aspCfg.allowedOrb as Record<AspectType, number>;
  const base = aspCfg.base as Record<AspectType, number>;

  const targets: { type: AspectType; angle: number }[] = [
    { type: "conj", angle: 0 },
    { type: "sextile", angle: 60 },
    { type: "square", angle: 90 },
    { type: "trine", angle: 120 },
    { type: "opposition", angle: 180 },
  ];

  const aspects: Aspect[] = [];
  for (let i = 0; i < P.length; i++) {
    for (let j = i + 1; j < P.length; j++) {
      const a = P[i], b = P[j];

      // ✅ 永恒结构：交点轴永远180°，不计入相位列表（避免污染）
      if (
        (a.body === "NorthNode" && b.body === "SouthNode") ||
        (a.body === "SouthNode" && b.body === "NorthNode")
      ) {
        continue;
      }

      const d = angleDistance(a.lon, b.lon);

      let best: { type: AspectType; orb: number; angle: number } | null = null;
      for (const t of targets) {
        const orb = Math.abs(d - t.angle);
        if (orb <= allowed[t.type]) {
          if (!best || orb < best.orb) best = { type: t.type, orb, angle: t.angle };
        }
      }
      if (!best) continue;

      const w = (base[best.type] || 0) * (1 - best.orb / allowed[best.type]);
      aspects.push({
        a: a.body,
        b: b.body,
        type: best.type,
        orb: Number(best.orb.toFixed(3)),
        weight: Number(w.toFixed(6)),
        delta: Number(d.toFixed(3)),
      });
    }
  }
  return aspects;
}

/** PairEffect(pair,trait) 取值 */
function getPairEffect(pairA: string, pairB: string, trait: TraitKey): number {
  const cfg = getConfig();
  const eff = cfg.A3_pairEffect_Trait.effects || {};
  const key1 = `${pairA}-${pairB}`;
  const key2 = `${pairB}-${pairA}`;
  const obj = eff[key1] || eff[key2];
  if (!obj) return 0;
  const v = obj[trait];
  return Number.isFinite(Number(v)) ? Number(v) : 0;
}

/** 相位 sign(type)：trine/sextile +1, square/opposition -1, conj 用 +1（让pairEffect决定符号） */
function signOfAspect(type: AspectType): number {
  if (type === "trine" || type === "sextile") return 1;
  if (type === "square" || type === "opposition") return -1;
  return 1;
}

/** Trait：算 raw + evidence（score 由 computeScore 统一归一化） */
function computeTraitRaw(
  trait: TraitKey,
  planets: PlanetRow[],
  aspects: Aspect[],
  repFactorByBody: Map<string, number>,
  trace: boolean
): TraitEvidence {
  const cfg = getConfig();
  const PW = cfg.weights.planetBaseWeight_PW as Record<string, number>;
  const Rel = cfg.A1_rel_PlanetToTrait.matrix[trait] as Record<string, number> | undefined;
  const HouseAct = cfg.A4_houseAct_Trait.matrix as Record<string, Record<string, number>>;

  let raw = 0;

  const planetEvidence: EvidenceItem[] = [];
  const aspectEvidence: EvidenceItem[] = [];

  const planetContribs: PlanetContrib[] = [];
  const aspectContribs: AspectContrib[] = [];

  // 行星贡献
  for (const p of planets) {
    if (!isTraitBody(p.body)) continue;

    const rel = Rel?.[p.body] ?? 0;
    if (rel <= 0) continue;

    const pw = PW[p.body] ?? 0;
    const sev = computeSEV(p.sign);
    const signAdj = computeSignAdj(trait, sev);
    const ha = (HouseAct?.[String(p.house)]?.[trait] ?? 0);
    const rep = repFactorByBody.get(p.body) ?? 1;

    const c = pw * rel * (1 + signAdj) * (1 + ha) * rep;
    raw += c;

    planetEvidence.push({
      source: `${p.body}(${p.sign}/${p.house}宫)`,
      value: c,
      detail: { pw, rel, signAdj, houseAct: ha, rep }
    });

    if (trace) {
      planetContribs.push({
        body: p.body,
        sign: p.sign,
        house: p.house,
        pw, rel, signAdj,
        houseAct: ha,
        rep,
        contrib: c,
      });
    }
  }

  // 相位贡献（只允许 10 行星参与 Trait 相位）
  let aspectSum = 0;
  for (const a of aspects) {
    if (!isTraitBody(a.a) || !isTraitBody(a.b)) continue;

    const pe = getPairEffect(a.a, a.b, trait);
    if (pe === 0) continue;

    const sgn = signOfAspect(a.type);
    const contrib = a.weight * pe * sgn;
    aspectSum += contrib;

    aspectEvidence.push({
      source: `${a.a}-${a.b}(${a.type},orb=${a.orb})`,
      value: contrib,
      detail: { weight: a.weight, pairEffect: pe, sign: sgn }
    });

    if (trace) {
      aspectContribs.push({
        a: a.a,
        b: a.b,
        type: a.type,
        orb: a.orb,
        weight: a.weight,
        pairEffect: pe,
        sign: sgn,
        contrib,
      });
    }
  }

  const rawAdjusted = raw + aspectSum;

  const topPlanets = planetEvidence
    .slice()
    .sort((x, y) => Math.abs(y.value) - Math.abs(x.value))
    .slice(0, 3)
    .map(x => ({ ...x, value: Number(x.value.toFixed(6)) }));

  const topAspects = aspectEvidence
    .slice()
    .sort((x, y) => Math.abs(y.value) - Math.abs(x.value))
    .slice(0, 2)
    .map(x => ({ ...x, value: Number(x.value.toFixed(6)) }));

  return {
    topPlanets,
    topAspects,
    raw: Number(rawAdjusted.toFixed(6)),
    score: 0,
    planetContribs: trace ? planetContribs : undefined,
    aspectContribs: trace ? aspectContribs : undefined,
  };
}

/** NSV（交点脚本8维） */
function computeNSV(planets: PlanetRow[], aspects: Aspect[], traits: Record<TraitKey, number>) {
  const cfg = getConfig();
  const nodeCfg = cfg.nodeScript_NSV;

  const north = planets.find(p => p.body === "NorthNode");
  const south = planets.find(p => p.body === "SouthNode");
  const northHouse = north?.house ?? 0;
  const southHouse = south?.house ?? 0;

  const nodePairWeight = nodeCfg.nodePairWeight as Record<string, number>;
  const trig = nodeCfg.triggerIntensityByHouse as Record<string, number>;

  const isHard = (t: AspectType) => t === "square" || t === "opposition";
  const isSaturnLink = (nodeBody: string) =>
    aspects.some(a =>
      (a.a === nodeBody && a.b === "Saturn" && a.weight > 0) ||
      (a.b === nodeBody && a.a === "Saturn" && a.weight > 0)
    );

  const NAS = (nodeBody: "NorthNode" | "SouthNode") => {
    let sum = 0;
    for (const a of aspects) {
      const hit = (a.a === nodeBody) ? a.b : (a.b === nodeBody ? a.a : null);
      if (!hit) continue;
      const w = nodePairWeight[hit] ?? 0;
      if (!w) continue;
      sum += a.weight * w;
    }
    return sum;
  };

  const HardAspectsStrength = (nodeBody: "NorthNode" | "SouthNode") =>
    aspects
      .filter(a => (a.a === nodeBody || a.b === nodeBody) && isHard(a.type))
      .reduce((acc, a) => acc + a.weight, 0);

  const integration = Math.min(
    traits.SelfTrust ?? 0,
    traits.BoundaryStrength ?? 0,
    traits.DisciplineRoutine ?? 0
  ); // 0~100

  const nasSouth = NAS("SouthNode");
  const nasNorth = NAS("NorthNode");

  const Fallback = clamp(40 + 35 * nasSouth + 15 * (trig[String(southHouse)] ?? 0));
  const UpgradePull = clamp(40 + 30 * nasNorth + 20 * (trig[String(northHouse)] ?? 0));
  const Friction = clamp(35 + 40 * HardAspectsStrength("NorthNode") + 15 * (isSaturnLink("NorthNode") ? 1 : 0));

  // RepeatLoopIndex：避免饱和缩放
  const repeatZ = (0.7 * Fallback + 0.5 * Friction - 0.4 * integration - 25) / 15;
  const RepeatLoopIndex = clamp(100 * sigmoid(repeatZ));

  const ComfortDependency = clamp(40 + 20 * (trig[String(southHouse)] ?? 0) + 10 * nasSouth);
  const BreakthroughLeverage = clamp(40 + 20 * (trig[String(northHouse)] ?? 0) + 15 * nasNorth);
  const StressSwitchSensitivity = clamp(30 + 25 * HardAspectsStrength("SouthNode") + ((traits.EmotionalRegulation ?? 0) < 40 ? 15 : 0));
  const IntegrationAbility = clamp(integration);

  return {
    FallbackStrength: Number(Fallback.toFixed(2)),
    UpgradePull: Number(UpgradePull.toFixed(2)),
    GrowthFriction: Number(Friction.toFixed(2)),
    ComfortDependency: Number(ComfortDependency.toFixed(2)),
    RepeatLoopIndex: Number(RepeatLoopIndex.toFixed(2)),
    BreakthroughLeverage: Number(BreakthroughLeverage.toFixed(2)),
    StressSwitchSensitivity: Number(StressSwitchSensitivity.toFixed(2)),
    IntegrationAbility: Number(IntegrationAbility.toFixed(2))
  };
}

/** Domains：加权平均 + 校准 + scene乘法 + script小幅加减（带 debug evidence） */
function computeDomainsWithEvidence(
  planets: PlanetRow[],
  traits: Record<TraitKey, number>,
  nsv: Record<string, number>
) {
  const cfg = getConfig();
  const dom = cfg.domains;

  const W = dom.weights_W as Record<DomainKey, Record<string, number>>;
  const scene = dom.sceneBonus as Record<string, any>;

  const scriptMax = Number(dom.scriptModifier?.max ?? 6);
  const lambda = Number(dom.domainCalibration?.lambda ?? 1.35);

  const north = planets.find(p => p.body === "NorthNode");
  const south = planets.find(p => p.body === "SouthNode");
  const northHouse = north?.house ?? 0;
  const southHouse = south?.house ?? 0;

  const triggerIntensity = (domainKey: DomainKey) => {
    const map = scene[domainKey] || {};
    const hotHouses = Object.keys(map)
      .filter(x => x.startsWith("H"))
      .map(x => Number(x.slice(1)));

    if (hotHouses.includes(northHouse) || hotHouses.includes(southHouse)) return 1;
    return 0.5;
  };

  // sceneFactor 最大 +12%
  const sceneFactorOf = (domainKey: DomainKey) => {
    const t = triggerIntensity(domainKey);
    return 0.12 * t;
  };

  const out: Record<DomainKey, number> = {
    Love: 0, Friendship: 0, Family: 0, Career: 0, Investment: 0, Resilience: 0
  };
  const domainEv: Record<DomainKey, DomainEvidence> = {} as any;

  const Fallback = Number(nsv.FallbackStrength ?? 0);
  const Pull = Number(nsv.UpgradePull ?? 0);
  const scriptFactor = ((Pull - Fallback) / 100) * scriptMax;

  for (const d of Object.keys(out) as DomainKey[]) {
    const w = W[d] || {};

    let num = 0;
    let den = 0;

    const traitsUsed: DomainEvidence["traitsUsed"] = [];

    for (const [traitKey, weight] of Object.entries(w)) {
      const t = traitKey as TraitKey;
      const ww = Number(weight);
      const ts = Number(traits[t] ?? 0);
      const contrib = ts * ww;

      num += contrib;
      den += Math.abs(ww);

      traitsUsed.push({
        traitKey: t,
        weight: ww,
        traitScore: ts,
        contrib,
      });
    }

    const base = den > 0 ? (num / den) : 0; // 0~100（均值）
    const calibrated = 50 + lambda * (base - 50);

    const sceneFactor = sceneFactorOf(d);
    const trig = triggerIntensity(d);

    const value = clamp(calibrated * (1 + sceneFactor) + scriptFactor);
    out[d] = Number(value.toFixed(2));

    domainEv[d] = {
      domain: d,
      base: Number(base.toFixed(2)),
      num: Number(num.toFixed(4)),
      den: Number(den.toFixed(4)),
      lambda,
      calibrated: Number(calibrated.toFixed(2)),
      sceneFactor: Number(sceneFactor.toFixed(4)),
      scriptFactor: Number(scriptFactor.toFixed(2)),
      value: Number(value.toFixed(2)),
      trigger: trig,
      traitsUsed: traitsUsed
        .slice()
        .sort((a, b) => Math.abs(b.contrib) - Math.abs(a.contrib))
        .slice(0, 16),
    };
  }

  return { domains: out, domainEvidence: domainEv };
}

/** 主入口：输入 keyConfig -> 输出完整评分（支持 trace） */
export function computeScore(keyConfig: any, opts?: { trace?: boolean }): ScoreResult {
  const trace = Boolean(opts?.trace);

  const planets = extractPlanets(keyConfig);
  const aspects = computeAspects(planets);
  const { factorByBody, detail } = computeRepetition(planets);

  const traitKeys = (getConfig().traits.list as any[]).map((x: any) => x.key) as TraitKey[];

  const traits: Record<TraitKey, number> = {} as any;
  const traits_raw: Record<TraitKey, number> = {} as any;
  const traitsEvidence: Record<TraitKey, TraitEvidence> = {} as any;
  const rawMap: Record<TraitKey, number> = {} as any;

  // 第一遍：算 raw + evidence
  for (const t of traitKeys) {
    const ev = computeTraitRaw(t, planets, aspects, factorByBody, trace);
    traitsEvidence[t] = ev;
    rawMap[t] = ev.raw;
  }

  // ✅ 关键修复：Trait 归一化改为 “盘内 zscore + tanh”
  // 不会全100，也不会 minmax 把最低压成0
  const raws = traitKeys.map((t) => rawMap[t]).filter((x) => Number.isFinite(x)) as number[];
  const mean = raws.reduce((a, b) => a + b, 0) / Math.max(1, raws.length);
  const variance =
    raws.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) / Math.max(1, raws.length);
  const std = Math.sqrt(variance) || 1;

  // k：越大差异越“温和”；默认 1.5 比较像人
  const k = 1.5;

  for (const t of traitKeys) {
    const raw = rawMap[t];
    const z = (raw - mean) / std;

    // 50 为中位，±35 为可视范围，tanh 保证不饱和
    const s = clamp(50 + 35 * Math.tanh(z / k));

    traits[t] = Number(s.toFixed(2));
    traits_raw[t] = Number(raw.toFixed(6));
    traitsEvidence[t].score = Number(s.toFixed(2));

    if (trace) {
      traitsEvidence[t].normalization = {
        method: "zscore_tanh_in_chart",
        formula: "z=(raw-mean)/std; score=clamp(50+35*tanh(z/k))",
        mean: Number(mean.toFixed(6)),
        std: Number(std.toFixed(6)),
        k,
        detail: `raw=${raw.toFixed(6)} mean=${mean.toFixed(6)} std=${std.toFixed(6)} k=${k}`,
      };
    }
  }

  // NSV（基于归一化 traits）
  const nsv = computeNSV(planets, aspects, traits);

  // Domains（含证据）
  const { domains, domainEvidence } = computeDomainsWithEvidence(planets, traits, nsv);

  return {
    traits,
    traits_raw,
    nsv,
    domains,
    evidence: {
      traits: traitsEvidence,
      aspects,
      repetition: detail,
      normalization: {
        method: "zscore_tanh_in_chart",
        detail: `mean=${mean.toFixed(6)} std=${std.toFixed(6)} k=${k}`,
      },
      domains: domainEvidence
    }
  };
}