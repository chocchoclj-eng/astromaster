// lib/scoring/spectrum20.mapping.ts
// 20 条“连续谱”定义：左端 / 右端两个极端，中间是平衡。

export type TraitKey =
  | "DecisionSpeed" | "DecisionConfidence" | "AnalyticalDepth" | "SystemsThinking"
  | "ExecutionDrive" | "Adaptability" | "DisciplineRoutine"
  | "EmotionalSensitivity" | "EmotionalRegulation" | "StressTolerance" | "RecoveryNeed"
  | "SelfTrust" | "MeaningDrive"
  | "AttachmentSecurityNeed" | "BoundaryStrength"
  | "WarmthNurturance" | "InfluenceNegotiation"
  | "RiskAppetite" | "RiskControl" | "ValueStability" | "PowerIntensityDrive";

export type Traits = Partial<Record<TraitKey, number>>;

export type WeightedFormula = {
  weights: Partial<Record<TraitKey, number>>;
  pretty?: string;
};

export type Spectrum20Id =
  | "Decisiveness" | "Prudence" | "Execution" | "Adaptation" | "ResilienceCore"
  | "LogicAnalysis" | "SystemsBuilding" | "Persuasion" | "Intuition" | "PurposeDrive"
  | "Sensitivity" | "Regulation" | "AttachmentNeed" | "Boundaries" | "Warmth" | "Cooperation"
  | "Creativity" | "AestheticsArt" | "Connector" | "SelfGrounding";

export type SpectrumDef = {
  id: Spectrum20Id;
  title: string; // 修复前端报错的关键字段
  leftLabel: string;
  rightLabel: string;
  desc: string;
  leftIndexFormula: WeightedFormula;
  rightIndexFormula: WeightedFormula;
};

export const SPECTRUM_20: SpectrumDef[] = [
  {
    id: "Decisiveness",
    title: "决策风格谱",
    leftLabel: "审慎拍板",
    rightLabel: "快速决断",
    desc: "衡量你在决策时：是优先追求准确安全，还是优先追求效率速度。",
    leftIndexFormula: {
      weights: { DecisionConfidence: 0.7, RiskControl: 0.3 },
      pretty: "0.7×确定性 + 0.3×风控",
    },
    rightIndexFormula: {
      weights: { DecisionSpeed: 0.8, ExecutionDrive: 0.2 },
      pretty: "0.8×决策速度 + 0.2×推进力",
    },
  },
  {
    id: "Prudence",
    title: "风险识别谱",
    leftLabel: "机会导向",
    rightLabel: "避险导向",
    desc: "面对未知：你更先看到潜在的收益，还是更先看到可能的代价。",
    leftIndexFormula: {
      weights: { RiskAppetite: 0.7, Adaptability: 0.3 },
      pretty: "0.7×风险偏好 + 0.3×适应力",
    },
    rightIndexFormula: {
      weights: { RiskControl: 0.7, AnalyticalDepth: 0.3 },
      pretty: "0.7×风控能力 + 0.3×分析深度",
    },
  },
  {
    id: "Execution",
    title: "行动驱动谱",
    leftLabel: "有条不紊",
    rightLabel: "火力全开",
    desc: "在执行任务时：你倾向于按部就班的节奏，还是爆发性的强力推进。",
    leftIndexFormula: {
      weights: { DisciplineRoutine: 0.7, ValueStability: 0.3 },
    },
    rightIndexFormula: {
      weights: { ExecutionDrive: 0.7, PowerIntensityDrive: 0.3 },
    },
  },
  {
    id: "Adaptation",
    title: "环境适应谱",
    leftLabel: "原则坚守",
    rightLabel: "灵活迭代",
    desc: "面对变化的环境：你是坚持既定标准，还是根据现实快速调整。",
    leftIndexFormula: {
      weights: { ValueStability: 0.6, DisciplineRoutine: 0.4 },
    },
    rightIndexFormula: {
      weights: { Adaptability: 0.7, DecisionSpeed: 0.3 },
    },
  },
  {
    id: "ResilienceCore",
    title: "压力韧性谱",
    leftLabel: "敏感防御",
    rightLabel: "硬核抗压",
    desc: "高压环境下：你的系统是优先通过敏感反馈避险，还是通过高阈值消化压力。",
    leftIndexFormula: {
      weights: { EmotionalSensitivity: 0.6, RecoveryNeed: 0.4 },
    },
    rightIndexFormula: {
      weights: { StressTolerance: 0.7, SelfTrust: 0.3 },
    },
  },
  {
    id: "LogicAnalysis",
    title: "思维深度谱",
    leftLabel: "直觉感悟",
    rightLabel: "深度推演",
    desc: "处理信息时：你更依赖即时的洞察力，还是严密的逻辑拆解。",
    leftIndexFormula: {
      weights: { MeaningDrive: 0.5, EmotionalSensitivity: 0.5 },
    },
    rightIndexFormula: {
      weights: { AnalyticalDepth: 0.7, SystemsThinking: 0.3 },
    },
  },
  {
    id: "SystemsBuilding",
    title: "全局架构谱",
    leftLabel: "局部专注",
    rightLabel: "系统构建",
    desc: "看待问题：你更擅长深入细节打磨，还是构建宏观的系统逻辑。",
    leftIndexFormula: {
      weights: { ExecutionDrive: 0.6, DisciplineRoutine: 0.4 },
    },
    rightIndexFormula: {
      weights: { SystemsThinking: 0.8, AnalyticalDepth: 0.2 },
    },
  },
  {
    id: "Persuasion",
    title: "影响说服谱",
    leftLabel: "事实陈述",
    rightLabel: "情感共鸣",
    desc: "试图说服他人时：你更倾向于摆事实讲逻辑，还是通过情感驱动。",
    leftIndexFormula: {
      weights: { AnalyticalDepth: 0.6, ValueStability: 0.4 },
    },
    rightIndexFormula: {
      weights: { InfluenceNegotiation: 0.6, WarmthNurturance: 0.4 },
    },
  },
  {
    id: "Intuition",
    title: "洞察本能谱",
    leftLabel: "经验实证",
    rightLabel: "直觉闪现",
    desc: "判断事物：你更看重过往经验和数据，还是不可言说的直觉。",
    leftIndexFormula: {
      weights: { DisciplineRoutine: 0.6, RiskControl: 0.4 },
    },
    rightIndexFormula: {
      weights: { MeaningDrive: 0.6, EmotionalSensitivity: 0.4 },
    },
  },
  {
    id: "PurposeDrive",
    title: "目标动力谱",
    leftLabel: "生存安全",
    rightLabel: "意义自我",
    desc: "行动的深层动力：是为了建立稳固的安全保障，还是为了实现自我意义。",
    leftIndexFormula: {
      weights: { AttachmentSecurityNeed: 0.6, RiskControl: 0.4 },
    },
    rightIndexFormula: {
      weights: { MeaningDrive: 0.7, SelfTrust: 0.3 },
    },
  },
  {
    id: "Sensitivity",
    title: "情绪感知谱",
    leftLabel: "钝感冷静",
    rightLabel: "敏感精微",
    desc: "对于环境细节的捕捉：是保持高度冷静不受干扰，还是精准接收微小信号。",
    leftIndexFormula: {
      weights: { EmotionalRegulation: 0.7, StressTolerance: 0.3 },
    },
    rightIndexFormula: {
      weights: { EmotionalSensitivity: 0.8, AttachmentSecurityNeed: 0.2 },
    },
  },
  {
    id: "Regulation",
    title: "情绪调节谱",
    leftLabel: "外力安抚",
    rightLabel: "自我闭环",
    desc: "情绪波动后：你更需要他人的情感支持，还是倾向于独自消化复原。",
    leftIndexFormula: {
      weights: { AttachmentSecurityNeed: 0.6, WarmthNurturance: 0.4 },
    },
    rightIndexFormula: {
      weights: { EmotionalRegulation: 0.8, RecoveryNeed: 0.2 },
    },
  },
  {
    id: "AttachmentNeed",
    title: "亲密依赖谱",
    leftLabel: "独立疏离",
    rightLabel: "深度连接",
    desc: "在关系中：你更重视个人空间的纯粹，还是渴望深度的情感交融。",
    leftIndexFormula: {
      weights: { BoundaryStrength: 0.6, SelfTrust: 0.4 },
    },
    rightIndexFormula: {
      weights: { AttachmentSecurityNeed: 0.7, WarmthNurturance: 0.3 },
    },
  },
  {
    id: "Boundaries",
    title: "心理边界谱",
    leftLabel: "开放包容",
    rightLabel: "严谨防御",
    desc: "对待外界侵入：你是倾向于模糊边界以换取融合，还是建立清晰的防火墙。",
    leftIndexFormula: {
      weights: { WarmthNurturance: 0.6, Adaptability: 0.4 },
    },
    rightIndexFormula: {
      weights: { BoundaryStrength: 0.7, SelfTrust: 0.3 },
    },
  },
  {
    id: "Warmth",
    title: "社交温度谱",
    leftLabel: "礼貌客气",
    rightLabel: "热情关怀",
    desc: "在社交场合：你表现出的是克制的职业化，还是发自内心的情感温度。",
    leftIndexFormula: {
      weights: { EmotionalRegulation: 0.6, BoundaryStrength: 0.4 },
    },
    rightIndexFormula: {
      weights: { WarmthNurturance: 0.8, EmotionalSensitivity: 0.2 },
    },
  },
  {
    id: "Cooperation",
    title: "协作偏好谱",
    leftLabel: "独自征战",
    rightLabel: "团队协同",
    desc: "完成目标时：你更相信个人的单点突破，还是团队的博弈配合。",
    leftIndexFormula: {
      weights: { PowerIntensityDrive: 0.6, SelfTrust: 0.4 },
    },
    rightIndexFormula: {
      weights: { InfluenceNegotiation: 0.4, WarmthNurturance: 0.3, BoundaryStrength: 0.3 },
    },
  },
  {
    id: "Creativity",
    title: "创造能量谱",
    leftLabel: "稳健重现",
    rightLabel: "颠覆创新",
    desc: "面对任务：你倾向于使用成熟的方案，还是尝试前所未有的新路径。",
    leftIndexFormula: {
      weights: { DisciplineRoutine: 0.6, RiskControl: 0.4 },
    },
    rightIndexFormula: {
      weights: { MeaningDrive: 0.4, Adaptability: 0.3, EmotionalSensitivity: 0.3 },
    },
  },
  {
    id: "AestheticsArt",
    title: "审美感知谱",
    leftLabel: "实用主义",
    rightLabel: "精神审美",
    desc: "对事物的价值判断：更看重功能和效率，还是更看重美感与精神意涵。",
    leftIndexFormula: {
      weights: { ExecutionDrive: 0.6, RiskControl: 0.4 },
    },
    rightIndexFormula: {
      weights: { EmotionalSensitivity: 0.5, MeaningDrive: 0.5 },
    },
  },
  {
    id: "Connector",
    title: "社交连接谱",
    leftLabel: "深度窄交",
    rightLabel: "广度连接",
    desc: "人际网络构建：你倾向于极少数人的深度关系，还是广泛的信息流连接。",
    leftIndexFormula: {
      weights: { PowerIntensityDrive: 0.6, RecoveryNeed: 0.4 },
    },
    rightIndexFormula: {
      weights: { InfluenceNegotiation: 0.5, Adaptability: 0.5 },
    },
  },
  {
    id: "SelfGrounding",
    title: "自我锚定谱",
    leftLabel: "随行就市",
    rightLabel: "内心秩序",
    desc: "内心的稳定性：更容易受到外界评价的影响，还是拥有极强的内在自我评价体系。",
    leftIndexFormula: {
      weights: { AttachmentSecurityNeed: 0.6, Adaptability: 0.4 },
    },
    rightIndexFormula: {
      weights: { SelfTrust: 0.5, EmotionalRegulation: 0.3, DisciplineRoutine: 0.2 },
    },
  }
];

// 计算函数，确保在 engine 中调用时逻辑一致
export function evalSpectrumFormula(traits: Record<string, number>, formula: WeightedFormula): number {
  return Object.entries(formula.weights).reduce((acc, [k, w]) => {
    return acc + (traits[k] ?? 50) * (w as number);
  }, 0);
}