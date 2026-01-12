// src/lib/roleEngine.ts
import { ROLE_LIBRARY, type RoleId } from "./rolelibrary";

export type ExplainItem = {
  key?: string;
  body?: string;
  sign?: string;
  house?: number;
};

export type RoleResult = {
  primaryRole: RoleId;
  secondaryRoles: RoleId[];
  warnings: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reasons: { role: RoleId; hits: string[]; score: number }[];
};

/** 核心计算逻辑：将星盘点位转化为职业得分 */
export function inferRolesFromExplain(items: ExplainItem[]): RoleResult {
  const scoreMap = {} as Record<RoleId, { score: number; hits: string[] }>;
  (Object.keys(ROLE_LIBRARY) as RoleId[]).forEach(id => {
    scoreMap[id] = { score: 0, hits: [] };
  });

  if (!items || items.length === 0) {
    return { primaryRole: "RESEARCH_STRATEGIST", secondaryRoles: [], warnings: [], confidence: "LOW", reasons: [] };
  }

  // 辅助函数：快速获取行星数据并标准化字段
  const getP = (k: string) => items.find(i => i.key === k || i.body === k);
  const isSign = (p: any, name: string) => p?.sign?.includes(name);
  const isHouse = (p: any, num: number) => Number(p?.house) === num;

  const sun = getP("Sun");
  const asc = getP("ASC") || getP("Rising");
  const mc = getP("MC");
  const mercury = getP("Mercury");

  // --- A. 核心身份判定 (权重最高) ---
  if (sun) {
    // 太阳双子 5 宫：内容创作的顶级配置
    if (isSign(sun, "双子") && isHouse(sun, 5)) {
      addScore("NARRATIVE_CREATOR", 100, "灵魂：太阳双子 5 宫（内容创作之魂）");
      addScore("BUILDER_FOUNDER", -50, "抑制：灵动能量不适合枯燥构建");
    } else if (isSign(sun, "双子")) {
      addScore("NARRATIVE_CREATOR", 30, "特质：太阳双子带来的表达驱动");
    }
  }

  // --- B. 行为模式与面具 ---
  if (asc) {
    if (isSign(asc, "摩羯") || isHouse(asc, 1)) {
      addScore("SYSTEM_ARCHITECT", 40, "面具：上升摩羯/1 宫的严谨职业框架");
      addScore("BIZOPS_MONETIZATION", 20, "商业：摩羯带来的变现逻辑敏感");
    }
  }

  // --- C. 事业目标与公众形象 ---
  if (mc) {
    if (isSign(mc, "天秤") || isHouse(mc, 10)) {
      addScore("CONNECTOR_BD", 30, "事业：MC 天秤/10 宫的资源平衡能力");
    }
    if (isSign(mc, "摩羯")) {
      addScore("BUILDER_FOUNDER", 40, "事业：MC 摩羯的长期成就驱动");
    }
  }

  // --- D. 智力出口 (水星) ---
  if (mercury) {
    if (isSign(mercury, "双子") || isHouse(mercury, 6)) {
      addScore("RESEARCH_STRATEGIST", 30, "思维：水星强位带来的逻辑归因力");
      addScore("DATA_ANALYST", 20, "思维：数据敏感度加成");
    }
  }

  function addScore(role: RoleId, points: number, reason: string) {
    if (scoreMap[role]) {
      scoreMap[role].score += points;
      scoreMap[role].hits.push(reason);
    }
  }

  // 排序获取最终结果
  const ranked = (Object.keys(scoreMap) as RoleId[])
    .map(id => ({ role: id, score: scoreMap[id].score, hits: scoreMap[id].hits }))
    .sort((a, b) => b.score - a.score);

  // 调试诊断：在控制台打印打分表
  console.table(ranked.slice(0, 5));

  return {
    primaryRole: ranked[0].role,
    secondaryRoles: ranked.slice(1, 3).map(r => r.role),
    warnings: ["请平衡内在表达欲与外在专业面具。"],
    confidence: ranked[0].score > 50 ? "HIGH" : "MEDIUM",
    reasons: ranked.slice(0, 5)
  };
}