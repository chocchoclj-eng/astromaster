// lib/humanSummary.ts

type PlanetKey =
  | "Sun" | "Moon" | "Mercury" | "Venus" | "Mars"
  | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto"
  | "ASC" | "MC";

export const PLANET_CORE: Record<PlanetKey, string> = {
  Sun: "你的人生核心主题",
  Moon: "你的情绪模式与安全感来源",
  Mercury: "你的思考与表达方式",
  Venus: "你的爱与关系模式",
  Mars: "你的行动方式与欲望驱动力",
  Jupiter: "你的扩张、信念与成长方式",
  Saturn: "你的压力来源与人生课题",
  Uranus: "你的突破点与非传统特质",
  Neptune: "你的理想、迷惘与共情能力",
  Pluto: "你的人生深层转化与控制议题",
  ASC: "你给世界的第一印象",
  MC: "你的人生方向与社会角色",
};

export const SIGN_MEANING: Record<string, string> = {
  Aries: "直接、主动、以自我驱动",
  Taurus: "稳定、务实、重视安全与掌控",
  Gemini: "好奇、多变、以信息和交流为导向",
  Cancer: "情绪化、重视安全感与归属",
  Leo: "渴望被看见、表达自我价值",
  Virgo: "谨慎、分析型、追求秩序与改善",
  Libra: "以关系与平衡为中心",
  Scorpio: "深度、控制、强烈的情感与洞察",
  Sagittarius: "追求意义、自由与远方",
  Capricorn: "目标导向、责任感强、现实主义",
  Aquarius: "独立、理性、非传统",
  Pisces: "敏感、共情、容易模糊边界",
};

export const HOUSE_MEANING: Record<number, string> = {
  1: "自我认同与人生起点",
  2: "金钱、价值感与安全感",
  3: "沟通、学习与日常思维",
  4: "家庭、原生环境与内在根基",
  5: "创造力、恋爱与自我表达",
  6: "工作模式、健康与责任",
  7: "亲密关系与合作模式",
  8: "控制、亲密、危机与重生",
  9: "信念体系、远行与人生意义",
  10: "事业方向与社会角色",
  11: "社群、理想与未来愿景",
  12: "潜意识、逃避与内在世界",
};

export function buildHumanSummary(planet: {
  body: PlanetKey;
  sign: string;
  house: number;
}) {
  const core = PLANET_CORE[planet.body];
  const signText = SIGN_MEANING[planet.sign] ?? planet.sign;
  const houseText = HOUSE_MEANING[planet.house] ?? `第 ${planet.house} 宫`;

  return {
    title: `${symbolOf(planet.body)} ${planet.body}｜${planet.sign}座 · 第${planet.house}宫`,
    text: `${core}，呈现出${signText}的特质，并且强烈体现在${houseText}上。这会持续影响你在相关领域中的选择方式与心理反应。`,
  };
}

function symbolOf(body: PlanetKey) {
  return {
    Sun: "☉",
    Moon: "☽",
    Mercury: "☿",
    Venus: "♀",
    Mars: "♂",
    Jupiter: "♃",
    Saturn: "♄",
    Uranus: "♅",
    Neptune: "♆",
    Pluto: "♇",
    ASC: "↑",
    MC: "✦",
  }[body] ?? "";
}
