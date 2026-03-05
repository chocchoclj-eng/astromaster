// app/api/ai/score-explain/route.ts
import { NextResponse } from "next/server";
import { callGeminiJSON } from "@/lib/ai/gemini";
import { buildScorePrompt } from "@/lib/ai/scorePrompts";
import { percentileOf } from "@/lib/population/population";
// ✅ 核心：加载由 genPopulation.ts 生成的人群分布字典
import populationPack from "@/public/population.v1.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Kind = "overview" | "domain" | "trait" | "nsv";

type AIBlock = {
  title: string;
  scoreMeaning: string;
  sections: { key: string; title: string; text: string }[];
  evidenceUsed?: string[];
  percentile?: number; // ✅ 新增：排位数据
};

function json(status: number, obj: any) {
  return NextResponse.json(obj, { status });
}

/** ✅ 强制清洗 AI 返回的 Markdown 符号，保证 UI 纯净 */
function clean(str: any) {
  if (!str) return "";
  return String(str).replace(/\*\*/g, "").replace(/#/g, "").replace(/`/g, "").trim();
}

/** ✅ 揉平 AI 输出并注入人群百分位 */
function coerceAIBlock(x: any, payload: any): AIBlock | null {
  let target = x?.content ?? x?.result ?? x;
  if (!target || typeof target !== "object") return null;

  // 1. 计算人群百分位 (仅针对频谱类型)
  let percentile = undefined;
  if (payload.subtype === "spectrum" && populationPack?.percentiles) {
    const thresholds = (populationPack.percentiles as any)[payload.key];
    if (thresholds) {
      percentile = percentileOf(payload.value, thresholds);
    }
  }

  return {
    title: clean(target.title),
    scoreMeaning: clean(target.scoreMeaning),
    sections: (target.sections || []).map((s: any, i: number) => ({
      key: String(s?.key ?? `s${i}`),
      title: clean(s?.title ?? "要点"),
      text: clean(s?.text ?? ""),
    })),
    evidenceUsed: Array.isArray(target.evidenceUsed) ? target.evidenceUsed.map(String) : [],
    percentile,
  };
}

export async function POST(req: Request) {
  const startedAt = Date.now();
  const raw = await req.json().catch(() => null);
  
  if (!raw?.payload) return json(400, { ok: false, error: "Missing payload" });
  const { kind, payload } = raw;

  try {
    // 1. 预计算排位上下文，增强 AI 的“对比感”
    let populationContext = "";
    if (payload.subtype === "spectrum" && populationPack?.percentiles) {
      const thresholds = (populationPack.percentiles as any)[payload.key];
      const p = percentileOf(payload.value, thresholds);
      populationContext = `该用户在人群中处于第 ${p} 百分位。${
        p > 85 || p < 15 ? "此风格在人群中极具独特性。" : "此风格属于大众典型分布。"
      }`;
    }

    // 2. 构建 Prompt（将排位信息注入 payload）
    const prompt = buildScorePrompt({ 
      kind, 
      payload: { ...payload, populationContext } 
    });

    // 3. 调用 Gemini
    const modelOut = await callGeminiJSON(prompt.system, prompt.user);

    // 4. 结构化处理
    const content = coerceAIBlock(modelOut, payload);

    if (!content) throw new Error("AI 返回结构解析失败");

    return json(200, {
      ok: true,
      kind,
      content,
      debug: { elapsedMs: Date.now() - startedAt }
    });
  } catch (e: any) {
    console.error("[ScoreExplain API Error]", e);
    return json(500, { ok: false, error: e.message });
  }
}