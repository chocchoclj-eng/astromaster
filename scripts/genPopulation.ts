// scripts/genPopulation.ts
// 使用方法: npx ts-node scripts/genPopulation.ts
import fs from "node:fs";
import path from "node:path";

/** 22个基础维度 Key */
type TraitKey =
  | "DecisionSpeed" | "DecisionConfidence" | "AnalyticalDepth" | "SystemsThinking"
  | "ExecutionDrive" | "Adaptability" | "DisciplineRoutine"
  | "EmotionalSensitivity" | "EmotionalRegulation" | "StressTolerance" | "RecoveryNeed"
  | "SelfTrust" | "MeaningDrive"
  | "AttachmentSecurityNeed" | "BoundaryStrength"
  | "WarmthNurturance" | "InfluenceNegotiation"
  | "RiskAppetite" | "RiskControl"
  | "ValueStability" | "PowerIntensityDrive"
  | "ReciprocityFairness";

/** 20个连续谱 ID */
type SpectrumId =
  | "Decisiveness" | "Prudence" | "Execution" | "Adaptation" | "ResilienceCore"
  | "LogicAnalysis" | "SystemsBuilding" | "Persuasion" | "Intuition" | "PurposeDrive"
  | "Sensitivity" | "Regulation" | "AttachmentNeed" | "Boundaries" | "Warmth" | "Cooperation"
  | "Creativity" | "AestheticsArt" | "Connector" | "SelfGrounding";

/** * 核心公式：计算 20 条频谱
 * 逻辑：v = (RightIndex - LeftIndex + 100) / 2
 * 结果范围：0..100，50 为中点
 */
function calcSpectrumValues(traits: Record<TraitKey, number>): Record<SpectrumId, number> {
  const t = (k: TraitKey) => traits[k] ?? 50;

  // A. 决策与行动
  const v1 = (0.6 * t("DecisionSpeed") + 0.4 * t("ExecutionDrive")) - (0.6 * t("DecisionConfidence") + 0.4 * t("RiskControl"));
  const v2 = (0.5 * t("RiskControl") + 0.3 * t("AnalyticalDepth") + 0.2 * t("DisciplineRoutine")) - (0.7 * t("RiskAppetite") + 0.3 * t("DecisionSpeed"));
  const v3 = (0.7 * t("ExecutionDrive") + 0.3 * t("DisciplineRoutine")) - (0.6 * t("ExecutionDrive") + 0.4 * t("Adaptability"));
  const v4 = (0.7 * t("Adaptability") + 0.3 * t("RecoveryNeed")) - (0.6 * t("ValueStability") + 0.4 * t("StressTolerance"));
  const v5 = (0.5 * t("StressTolerance") + 0.3 * t("EmotionalRegulation") + 0.2 * t("RecoveryNeed")) - (0.6 * t("StressTolerance") + 0.4 * t("BoundaryStrength"));

  // B. 思维与表达
  const v6 = (0.7 * t("AnalyticalDepth") + 0.3 * t("SystemsThinking")) - (0.6 * t("EmotionalSensitivity") + 0.4 * t("MeaningDrive"));
  const v7 = (0.7 * t("SystemsThinking") + 0.3 * t("DisciplineRoutine")) - (0.7 * t("Adaptability") + 0.3 * t("InfluenceNegotiation"));
  const v8 = (0.7 * t("InfluenceNegotiation") + 0.3 * t("DecisionConfidence")) - (0.6 * t("WarmthNurturance") + 0.4 * t("EmotionalSensitivity"));
  const v9 = (0.5 * t("EmotionalSensitivity") + 0.3 * t("MeaningDrive") + 0.2 * t("AnalyticalDepth")) - (0.6 * t("AnalyticalDepth") + 0.4 * t("RiskControl"));
  const v10 = (0.8 * t("MeaningDrive") + 0.2 * t("SelfTrust")) - (0.6 * t("ExecutionDrive") + 0.4 * t("DecisionConfidence"));

  // C. 情绪与关系
  const v11 = (0.8 * t("EmotionalSensitivity") + 0.2 * t("AttachmentSecurityNeed")) - (0.7 * t("EmotionalRegulation") + 0.3 * t("BoundaryStrength"));
  const v12 = (0.8 * t("EmotionalRegulation") + 0.2 * t("RecoveryNeed")) - (0.7 * t("EmotionalSensitivity") + 0.3 * t("StressTolerance"));
  const v13 = (0.7 * t("AttachmentSecurityNeed") + 0.3 * t("WarmthNurturance")) - (0.7 * t("BoundaryStrength") + 0.3 * t("SelfTrust"));
  const v14 = (0.7 * t("BoundaryStrength") + 0.3 * t("SelfTrust")) - (0.6 * t("AttachmentSecurityNeed") + 0.4 * t("EmotionalSensitivity"));
  const v15 = (0.8 * t("WarmthNurturance") + 0.2 * t("EmotionalRegulation")) - (0.6 * t("BoundaryStrength") + 0.4 * t("RiskControl"));
  const v16 = (0.4 * t("InfluenceNegotiation") + 0.3 * t("WarmthNurturance") + 0.3 * t("BoundaryStrength")) - (0.6 * t("SelfTrust") + 0.4 * t("BoundaryStrength"));

  // D. 创造与连接
  const v17 = (0.4 * t("MeaningDrive") + 0.3 * t("Adaptability") + 0.3 * t("EmotionalSensitivity")) - (0.6 * t("ValueStability") + 0.4 * t("DisciplineRoutine"));
  const v18 = (0.5 * t("EmotionalSensitivity") + 0.3 * t("MeaningDrive") + 0.2 * t("WarmthNurturance")) - (0.6 * t("SystemsThinking") + 0.4 * t("AnalyticalDepth"));
  const v19 = (0.5 * t("InfluenceNegotiation") + 0.3 * t("Adaptability") + 0.2 * t("WarmthNurturance")) - (0.6 * t("AttachmentSecurityNeed") + 0.4 * t("BoundaryStrength"));
  const v20 = (0.5 * t("SelfTrust") + 0.3 * t("EmotionalRegulation") + 0.2 * t("DisciplineRoutine")) - (0.6 * t("DisciplineRoutine") + 0.4 * t("ValueStability"));

  const rawValues: Record<SpectrumId, number> = {
    Decisiveness: v1, Prudence: v2, Execution: v3, Adaptation: v4, ResilienceCore: v5,
    LogicAnalysis: v6, SystemsBuilding: v7, Persuasion: v8, Intuition: v9, PurposeDrive: v10,
    Sensitivity: v11, Regulation: v12, AttachmentNeed: v13, Boundaries: v14, Warmth: v15, Cooperation: v16,
    Creativity: v17, AestheticsArt: v18, Connector: v19, SelfGrounding: v20
  };

  // 映射到 0..100
  const out = {} as Record<SpectrumId, number>;
  for (const [k, v] of Object.entries(rawValues)) {
    out[k as SpectrumId] = Math.max(0, Math.min(100, (v + 100) / 2));
  }
  return out;
}

/** * 合成人群采样：基于潜变量 G1-G5 
 */
function sampleTraits(): Record<TraitKey, number> {
  const rand = () => Math.random();
  // 5个潜变量 (0..1)
  const G1_Action = rand(); 
  const G2_Logic = rand();
  const G3_Emotion = rand();
  const G4_Relation = rand();
  const G5_Risk = rand();

  const mix = (base: number, latent: number, weight = 0.3) => (base * (1 - weight) + latent * weight) * 100;

  return {
    DecisionSpeed: mix(rand(), G1_Action),
    ExecutionDrive: mix(rand(), G1_Action),
    AnalyticalDepth: mix(rand(), G2_Logic),
    SystemsThinking: mix(rand(), G2_Logic),
    DisciplineRoutine: mix(rand(), G2_Logic, 0.5),
    EmotionalSensitivity: mix(rand(), G3_Emotion),
    EmotionalRegulation: mix(rand(), 1 - G3_Emotion), // 敏感与调节负相关
    StressTolerance: mix(rand(), 1 - G3_Emotion),
    RecoveryNeed: mix(rand(), G3_Emotion),
    AttachmentSecurityNeed: mix(rand(), G4_Relation),
    WarmthNurturance: mix(rand(), G4_Relation),
    InfluenceNegotiation: mix(rand(), G4_Relation),
    RiskAppetite: mix(rand(), G5_Risk),
    RiskControl: mix(rand(), 1 - G5_Risk),
    DecisionConfidence: mix(rand(), G1_Action),
    Adaptability: mix(rand(), G1_Action),
    SelfTrust: mix(rand(), 0.5),
    MeaningDrive: mix(rand(), 0.5),
    BoundaryStrength: mix(rand(), 0.5),
    ValueStability: mix(rand(), 0.5),
    PowerIntensityDrive: mix(rand(), G5_Risk),
    ReciprocityFairness: mix(rand(), G4_Relation),
  };
}

async function main() {
  const N = 100000;
  const results: Record<SpectrumId, number[]> = {} as any;
  const spectrumIds: SpectrumId[] = ["Decisiveness", "Prudence", "Execution", "Adaptation", "ResilienceCore", "LogicAnalysis", "SystemsBuilding", "Persuasion", "Intuition", "PurposeDrive", "Sensitivity", "Regulation", "AttachmentNeed", "Boundaries", "Warmth", "Cooperation", "Creativity", "AestheticsArt", "Connector", "SelfGrounding"];
  
  spectrumIds.forEach(id => results[id] = []);

  console.log(`正在模拟 ${N} 人群数据...`);
  for (let i = 0; i < N; i++) {
    const traits = sampleTraits();
    const spectrums = calcSpectrumValues(traits);
    spectrumIds.forEach(id => results[id].push(spectrums[id]));
  }

  const percentiles: Record<string, number[]> = {};
  spectrumIds.forEach(id => {
    const sorted = results[id].sort((a, b) => a - b);
    const table = [];
    for (let p = 0; p <= 100; p++) {
      const idx = Math.min(N - 1, Math.floor((p / 100) * (N - 1)));
      table.push(Number(sorted[idx].toFixed(2)));
    }
    percentiles[id] = table;
  });

  const output = {
    meta: { version: "1.0", n: N, generatedAt: new Date().toISOString() },
    percentiles
  };

  const filePath = path.join(process.cwd(), "public", "population.v1.json");
  fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
  console.log("✅ 成功生成人群分布表:", filePath);
}

main();