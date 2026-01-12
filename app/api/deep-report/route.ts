// app/api/deep-report/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { readChart, saveDeepReport } from "@/lib/chartStore";
import { buildAstroPrompt } from "@/lib/buildAstroPrompt";

export const runtime = "nodejs";

const MODEL = "gemini-2.5-flash";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withRetry<T>(fn: () => Promise<T>, times = 3) {
  let lastErr: any;
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      await sleep(400 * (i + 1));
    }
  }
  throw lastErr;
}

export async function POST(req: Request) {
  try {
    const { id, mode } = await req.json();

    if (!id || !mode) {
      return NextResponse.json({ error: "缺少 id / mode" }, { status: 400 });
    }

    const chart = await readChart(id);
    if (!chart?.keyConfig) {
      return NextResponse.json({ error: "找不到该报告数据" }, { status: 404 });
    }

    const keyConfig = chart.keyConfig;
    const humanSummary = keyConfig.humanSummary;
    const overview = keyConfig.overview?.oneSentence;

    if (!Array.isArray(humanSummary) || humanSummary.length === 0) {
      return NextResponse.json(
        { error: "humanSummary 缺失：请先生成结构化结论层" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "缺少 GEMINI_API_KEY（请放到 .env.local）" },
        { status: 500 }
      );
    }

    const prompt = buildAstroPrompt({
      mode,
      userName: keyConfig.input?.name,
      overview,
      humanSummary,
    });

    const ai = new GoogleGenAI({ apiKey });

    const text = await withRetry(async () => {
      const resp = await ai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const out = resp.text?.trim();
      if (!out) throw new Error("AI 返回为空");
      return out;
    }, 3);

    // ✅ 可选：把深度报告存起来（你 chartStore 里加个函数）
    await saveDeepReport?.(text);

    return NextResponse.json({ ok: true, mode, text });
  } catch (e: any) {
    console.error("DEEP REPORT ERROR:", e);
    return NextResponse.json(
      { error: "深度报告生成失败，请稍后重试", detail: e?.message || "" },
      { status: 500 }
    );
  }
}
