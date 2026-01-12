// src/lib/career/normalizePlacements.ts
// ✅ 把后端 planets 规范成 astroExplain.ts 需要的代号体系
// ✅ 只做“代号规范化”，不做星盘计算

import type { Placement, BodyKey, SignZh } from "./careerEngine";

const SIGN_EN_TO_ZH: Record<string, SignZh> = {
  Aries: "白羊", Taurus: "金牛", Gemini: "双子", Cancer: "巨蟹",
  Leo: "狮子", Virgo: "处女", Libra: "天秤", Scorpio: "天蝎",
  Sagittarius: "射手", Capricorn: "摩羯", Aquarius: "水瓶", Pisces: "双鱼",
};

const BODY_ALIASES: Record<string, BodyKey> = {
  Sun: "Sun",
  Moon: "Moon",
  Mercury: "Mercury",
  Venus: "Venus",
  Mars: "Mars",
  Jupiter: "Jupiter",
  Saturn: "Saturn",
  Uranus: "Uranus",
  Neptune: "Neptune",
  Pluto: "Pluto",
  ASC: "ASC",
  Asc: "ASC",
  Rising: "ASC",
  MC: "MC",
  Mc: "MC",
  Midheaven: "MC",
  NorthNode: "NorthNode",
  NN: "NorthNode",
  "North Node": "NorthNode",
  SouthNode: "SouthNode",
  SN: "SouthNode",
  "South Node": "SouthNode",
};

function isSignZh(x: any): x is SignZh {
  return ["白羊","金牛","双子","巨蟹","狮子","处女","天秤","天蝎","射手","摩羯","水瓶","双鱼"].includes(x);
}

function normSign(sign: any): SignZh {
  if (isSignZh(sign)) return sign;
  if (typeof sign === "string" && SIGN_EN_TO_ZH[sign]) return SIGN_EN_TO_ZH[sign];
  if (typeof sign === "string") {
    const s = sign.trim();
    if (isSignZh(s)) return s;
  }
  throw new Error(`normalizePlacements: unknown sign "${String(sign)}"`);
}

function normBody(body: any): BodyKey {
  const b = String(body);
  const k = BODY_ALIASES[b];
  if (!k) throw new Error(`normalizePlacements: unknown body "${b}"`);
  return k;
}

function normHouse(h: any) {
  const n = Number(h);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

export function normalizePlacements(rawPlanets: any[]): Placement[] {
  if (!Array.isArray(rawPlanets)) return [];
  return rawPlanets.map((p) => {
    const body = normBody(p.body ?? p.key);
    const sign = normSign(p.sign ?? p.zodiac);
    const house = normHouse(p.house);
    const degree = p.degree != null ? Number(p.degree) : undefined;
    const lon = p.lon != null ? Number(p.lon) : undefined;
    return { body, sign, house, degree, lon };
  });
}
