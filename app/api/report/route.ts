// app/api/report/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

type Mode = "free" | "A" | "B" | "C";
type KeyConfigPlaceholder = any;
type ReportModule = { id: number; title: string; markdown: string };

function compactKeyConfig(keyConfig: KeyConfigPlaceholder) {
  const c = keyConfig?.core ?? {};

  const pickAspects = (arr: any[]) =>
    (arr ?? []).slice(0, 8).map((a: any) => ({
      a: a.a,
      b: a.b,
      type: a.type,
      orb: a.orb,
    }));

  const topHouses = (keyConfig?.houseFocusTop3 ?? []).map((x: any) => ({
    house: x.house,
    score: x.score,
    bodies: x.bodies,
  }));

  return {
    input: keyConfig?.input ?? {},
    // ✅ 把你 chart 端稳定版 overview 传进来（非常关键）
    overview: keyConfig?.overview ?? undefined,

    core: {
      sun: c.sun,
      moon: c.moon,
      asc: c.asc,
      mc: c.mc,
      saturn: c.saturn,
    },
    nodes: keyConfig?.nodes ?? undefined,
    humanSummary: keyConfig?.humanSummary ?? undefined,
    houseFocusTop3: topHouses,
    innerHardAspects: pickAspects(keyConfig?.innerHardAspectsTop3),
    saturnAspects: pickAspects(keyConfig?.saturnAspectsTop),
    outerHardAspects: pickAspects(keyConfig?.outerHardAspectsTop3),
  };
}

function parseMarkdownToStructuredData(markdown: string): { summary: string; modules: ReportModule[] } {
  const modules: ReportModule[] = [];
  let summary = "";

  const cleanMarkdown = markdown.replace(/---/g, "").trim();
  const parts = cleanMarkdown
    .split("##")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  parts.forEach((part) => {
    const lines = part.split("\n");
    const titleLine = lines[0] || "";
    const titleMatch = titleLine.match(/^(\d+)\s*(.*)/);

    if (titleMatch) {
      const id = parseInt(titleMatch[1], 10);
      const title = `## ${titleMatch[1]} ${titleLine.trim()}`;
      const markdownContent = lines.slice(1).join("\n").trim();

      // summary 取模块 0 的「结论一句话」
      if (id === 0) {
        const conclusionMatch = markdownContent.match(/1\)\s*结论一句话\s*💡\s*([\s\S]*)/);
        summary = conclusionMatch
          ? conclusionMatch[1].split("\n")[0].trim()
          : markdownContent.split("\n\n")[0].trim();
      }

      modules.push({ id, title, markdown: markdownContent });
    }
  });

  modules.sort((a, b) => a.id - b.id);
  return { summary, modules };
}

const signMap: Record<string, string> = {
  Aries: "白羊座",
  Taurus: "金牛座",
  Gemini: "双子座",
  Cancer: "巨蟹座",
  Leo: "狮子座",
  Virgo: "处女座",
  Libra: "天秤座",
  Scorpio: "天蝎座",
  Sagittarius: "射手座",
  Capricorn: "摩羯座",
  Aquarius: "水瓶座",
  Pisces: "双鱼座",
};

function translateSign(englishSign: string): string {
  return signMap[englishSign] || englishSign;
}

function buildPrompt(keyConfig: KeyConfigPlaceholder, mode: Mode): string {
  const mini = compactKeyConfig(keyConfig);

  // ✅ 核心星座翻译为中文（防止 AI 混英文）
  const coreKeys = ["sun", "moon", "asc", "mc", "saturn"] as const;
  const core = mini.core || {};

  coreKeys.forEach((k) => {
    if (core?.[k]?.sign) core[k].sign = translateSign(core[k].sign);
  });

  if (mini.nodes?.north?.sign) mini.nodes.north.sign = translateSign(mini.nodes.north.sign);
  if (mini.nodes?.south?.sign) mini.nodes.south.sign = translateSign(mini.nodes.south.sign);

  const base = `
你是一位专业的“结构化占星解读”写作助手。你的输出必须：清晰、可执行、用户听得懂。

【重要目标（写给真实用户看）】
- 用户不看速查表：你要把“太阳/月亮/上升/宫位/相位”讲成人话，然后立刻用这个人的真实数据下结论。
- 你必须做“交叉影响分析”：至少指出 1-2 处「A 的落点/相位」如何影响「B 的选择/关系/事业」。
- 每个模块都必须包含 低阶/中阶/高阶 三种表现：🔻 / 🟡 / ✅（用列表）。

【非常重要：稳定总览】
- 如果输入里有 overview.oneSentence：你必须把它当作“稳定版一句话总览”，在模块 0 的结论一句话里直接输出它（可以轻微润色但不要改含义）。
- 模块 1 在科普结束后，也要输出一条“这张盘的一句话画像”（尽量与 overview.oneSentence 保持一致）。

【格式要求】
1) 必须 Markdown。
2) 每个模块结束用 --- 分隔。
3) free 模式必须包含 H2：## 0 到 ## 6。
4) 每个模块严格七段结构（顺序固定）：
   1) 结论一句话 💡
   2) 证据点 🔬（只引用 JSON 字段，不加解释）
   3) 🔸（基础表现，列表）
   4) 🔻（低阶表现，列表）
   5) 🟡（中阶表现，列表）
   6) ✅（高阶表现，列表）
   7) 🛠️（2-3 条可执行建议，列表）

【输入数据（结构化证据）】
${JSON.stringify(mini, null, 2)}

【模块写法要求（关键）】
- 模块 1 必须先用“人话”解释：
  太阳是什么、月亮是什么、上升/MC 是什么、宫位是什么、相位是什么（合/冲/刑/拱/六合 + orb 越小越强）。
  然后必须给“这张盘的一句话画像”（只输出 1 句，不要知识科普）。
  再用本人的盘举 1 个例子说明“怎么从数据推结论”（例如：太阳巨蟹座第4宫=什么含义）。
- 模块 2~6：
  结论一句话必须直给结论，不要绕；
  🔸/🔻/🟡/✅ 体现“行为层面的差异”，并且至少 1 条写交叉影响（最好放在 🟡 或 ✅）。
- “证据点 🔬”只写字段，例如：\`core.sun.sign: 巨蟹座\`、\`innerHardAspects[0].type: SQR\`，不要解释。

【深度模式指令】
- 如果 mode 不是 free：只输出该模式内容（不输出 0-6），但仍要求：七段结构 + 低/中/高 + 交叉影响。
`;

  const modeExtra: Record<Mode, string> = {
    free: `【free】输出完整基础报告：##0~##6。`,
    A: `【A】聚焦关系/亲密：月亮、金星线索、七宫主题、硬相位如何触发关系模式；输出可执行沟通/边界策略。`,
    B: `【B】聚焦事业/财富：MC/十宫、二宫线索、土星课题、硬相位如何影响职业决策与资源配置；输出“系统化路径”。`,
    C: `【C】聚焦心理/整合：土星相位、内行星硬相位；按“触发点→旧模式→新模式→训练动作”给清晰练习。`,
  };

  return base + "\n" + modeExtra[mode];
}

function modelFor(_: Mode) {
  return "gemini-2.5-flash";
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ✅ 更稳：兼容多种 SDK 返回结构
function extractText(resp: any): string {
  if (!resp) return "";
  if (typeof resp.text === "string") return resp.text;
  if (typeof resp.text === "function") {
    try {
      const t = resp.text();
      if (typeof t === "string") return t;
    } catch {}
  }
  // 兼容候选结构
  const parts =
    resp?.candidates?.[0]?.content?.parts ??
    resp?.response?.candidates?.[0]?.content?.parts ??
    resp?.response?.candidates?.[0]?.content?.[0]?.parts;

  if (Array.isArray(parts)) {
    return parts.map((p: any) => p?.text).filter(Boolean).join("");
  }
  return "";
}

async function callGemini(systemInstruction: string, userPrompt: string, mode: Mode) {
  const MAX_RETRIES = 5;
  let delayTime = 5000;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: modelFor(mode),
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction,
          temperature: 0.4,
          maxOutputTokens: 3500,
        },
      });
      return response;
    } catch (e: any) {
      if (e?.status === 503 && attempt < MAX_RETRIES - 1) {
        console.warn(`Gemini 503，${delayTime / 1000}s 后重试... (${attempt + 1}/${MAX_RETRIES})`);
        await delay(delayTime);
        delayTime *= 2;
      } else {
        throw e;
      }
    }
  }

  throw new Error("达到最大重试次数，仍无法连接到 Gemini API。");
}

const REQUIRED = [
  "## 0 输入信息",
  "## 1 主轴骨架",
  "## 2 人生主战场",
  "## 3 人格冲突点",
  "## 4 土星难度条",
  "## 5 外行星转折机制",
  "## 6 灵魂方向",
];

function missingHeadings(text: string) {
  return REQUIRED.filter((h) => !text.includes(h));
}

function mergeAndDeduplicate(originalText: string, newText: string): string {
  if (!newText) return originalText;

  const newHeadings = newText.match(/##\s*\d+\s*(.*?)(?:\n|$)/g) || [];
  let textToMerge = originalText;

  newHeadings.forEach((newH) => {
    const idMatch = newH.match(/##\s*(\d+)/);
    if (idMatch) {
      const id = idMatch[1];
      const regex = new RegExp(`##\\s*${id}\\s*.*?(?=(##\\s*\\d+|\\s*$))`, "gs");
      textToMerge = textToMerge.replace(regex, "");
    }
  });

  return (textToMerge.trim() + "\n\n" + newText.trim()).trim();
}

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY in .env.local" }, { status: 500 });
    }

    const { keyConfig, mode = "free" } = (await req.json()) as {
      keyConfig?: KeyConfigPlaceholder;
      mode?: Mode;
    };

    if (!keyConfig) {
      return NextResponse.json({ error: "Missing keyConfig" }, { status: 400 });
    }

    const systemInstruction = buildPrompt(keyConfig, mode);
    const userPrompt = `按系统指令输出报告。${mode === "free" ? "必须覆盖所有模块（##0~##6），不要漏。" : ""}`;

    // 1) 首次生成（带 503 重试）
    const r1 = await callGemini(systemInstruction, userPrompt, mode);
    let text = extractText(r1).trim();

    // 2) free 模式：缺失补救
    if (mode === "free") {
      const miss1 = missingHeadings(text);
      if (miss1.length > 0 || text.length < 1000) {
        const modulesToRescue = miss1.length > 0 ? miss1.join(", ") : "文本疑似中断，请从中断处继续补齐";
        console.warn(`缺失/中断: ${modulesToRescue}，开始补救...`);

        const rescuePrompt = `你上一次输出不完整，缺失或中断在：${modulesToRescue}。只输出这些缺失模块，从对应 ## 标题开始，严格七段结构。`;
        const r2 = await callGemini(systemInstruction, rescuePrompt, mode);
        const add = extractText(r2).trim();
        text = mergeAndDeduplicate(text, add);
      }
    }

    if (!text) {
      return NextResponse.json({ error: "Gemini returned empty text" }, { status: 502 });
    }

    // 3) 解析结构化返回
    if (mode === "free") {
      const { summary, modules } = parseMarkdownToStructuredData(text);

      // 你前端如果自己渲染输入信息/科普区，可以继续过滤 0
      // 如果你希望 Gemini 生成的 0 也展示，就把这一行删掉即可
      const finalModules = modules.filter((m) => m.id !== 0);

      return NextResponse.json({ summary, modules: finalModules, deep: {} });
    } else {
      const deepKey = mode as "A" | "B" | "C";
      return NextResponse.json({ summary: "", modules: [], deep: { [deepKey]: text } });
    }
  } catch (e: any) {
    console.error("REPORT API ERROR:", e);
    return NextResponse.json({ error: e?.message || "Report API failed" }, { status: 500 });
  }
}
