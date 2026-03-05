// lib/population/population.ts
export type SpectrumId =
  | "Decisiveness" | "Prudence" | "Execution" | "Adaptation" | "ResilienceCore"
  | "LogicAnalysis" | "SystemsBuilding" | "Persuasion" | "Intuition" | "PurposeDrive"
  | "Sensitivity" | "Regulation" | "AttachmentNeed" | "Boundaries" | "Warmth" | "Cooperation"
  | "Creativity" | "AestheticsArt" | "Connector" | "SelfGrounding";

export type TraitKey =
  | "DecisionSpeed" | "DecisionConfidence" | "AnalyticalDepth" | "SystemsThinking"
  | "ExecutionDrive" | "Adaptability" | "DisciplineRoutine"
  | "EmotionalSensitivity" | "EmotionalRegulation" | "StressTolerance" | "RecoveryNeed"
  | "SelfTrust" | "MeaningDrive"
  | "AttachmentSecurityNeed" | "BoundaryStrength"
  | "WarmthNurturance" | "InfluenceNegotiation"
  | "RiskAppetite" | "RiskControl"
  | "ValueStability" | "PowerIntensityDrive"
  | "ReciprocityFairness";

export type PopulationPack = {
  meta: { version: string; n: number; generatedAt: string; note?: string };
  percentiles: Record<SpectrumId, number[]>; // 101 points: 0..100
};

export function calc20FromTraits(traits: Record<TraitKey, number>) {
  const t = (k: TraitKey) => Number(traits[k] ?? 0);

  const out = {
    Decisiveness: 0.6 * t("DecisionConfidence") + 0.4 * t("DecisionSpeed"),
    Prudence: 0.5 * t("RiskControl") + 0.3 * t("AnalyticalDepth") + 0.2 * t("DisciplineRoutine"),
    Execution: 0.7 * t("ExecutionDrive") + 0.3 * t("DisciplineRoutine"),
    Adaptation: 0.7 * t("Adaptability") + 0.3 * t("RecoveryNeed"),
    ResilienceCore: 0.5 * t("StressTolerance") + 0.3 * t("EmotionalRegulation") + 0.2 * t("RecoveryNeed"),

    LogicAnalysis: 0.7 * t("AnalyticalDepth") + 0.3 * t("SystemsThinking"),
    SystemsBuilding: 0.7 * t("SystemsThinking") + 0.3 * t("DisciplineRoutine"),
    Persuasion: 0.7 * t("InfluenceNegotiation") + 0.3 * t("DecisionConfidence"),
    Intuition: 0.5 * t("EmotionalSensitivity") + 0.3 * t("MeaningDrive") + 0.2 * t("AnalyticalDepth"),
    PurposeDrive: 0.8 * t("MeaningDrive") + 0.2 * t("SelfTrust"),

    Sensitivity: 0.8 * t("EmotionalSensitivity") + 0.2 * t("AttachmentSecurityNeed"),
    Regulation: 0.8 * t("EmotionalRegulation") + 0.2 * t("RecoveryNeed"),
    AttachmentNeed: 0.7 * t("AttachmentSecurityNeed") + 0.3 * t("WarmthNurturance"),
    Boundaries: 0.7 * t("BoundaryStrength") + 0.3 * t("SelfTrust"),
    Warmth: 0.8 * t("WarmthNurturance") + 0.2 * t("EmotionalRegulation"),
    Cooperation: 0.4 * t("InfluenceNegotiation") + 0.3 * t("WarmthNurturance") + 0.3 * t("BoundaryStrength"),

    Creativity: 0.4 * t("MeaningDrive") + 0.3 * t("Adaptability") + 0.3 * t("EmotionalSensitivity"),
    AestheticsArt: 0.5 * t("EmotionalSensitivity") + 0.2 * t("WarmthNurturance") + 0.3 * t("MeaningDrive"),
    Connector: 0.5 * t("InfluenceNegotiation") + 0.3 * t("Adaptability") + 0.2 * t("WarmthNurturance"),
    SelfGrounding: 0.5 * t("SelfTrust") + 0.3 * t("EmotionalRegulation") + 0.2 * t("DisciplineRoutine"),
  } as const;

  const clamp = (x: number) => Math.max(0, Math.min(100, Number.isFinite(x) ? x : 0));
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, clamp(v)])) as Record<SpectrumId, number>;
}

/** 给一个值 v，和该维度的 0..100% 阈值表，返回 percentile（0..100） */
export function percentileOf(v: number, thresholds: number[]) {
  // thresholds 长度 101：thresholds[p] = p分位的数值
  // 找最大的 p 使 thresholds[p] <= v
  let lo = 0, hi = 100;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (v >= thresholds[mid]) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}