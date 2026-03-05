// lib/ai/gemini.ts

type GeminiJSONOptions = {
    model?: string;
    timeoutMs?: number;
    retries?: number;
    temperature?: number;
    maxOutputTokens?: number; // 建议调大
    debug?: boolean;
  };
  
  function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }
  
  function getEnv(name: string) {
    return (process.env[name] ?? "").trim();
  }
  
  async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
    const ac = new AbortController();
    const id = setTimeout(() => ac.abort(), timeoutMs);
    try {
      return await fetch(url, { ...init, signal: ac.signal });
    } finally {
      clearTimeout(id);
    }
  }
  
  function extractTextFromGeminiResponse(resp: any): string {
    const parts = resp?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
      const t = parts.map((p: any) => p?.text).filter(Boolean).join("\n");
      return String(t || "").trim();
    }
    return String(resp?.text || "").trim();
  }
  
  /** 核心修复逻辑：把乱七八糟的 AI 输出变成合法 JSON */
  function repairJSON(text: string): string {
    let t = String(text || "").trim();
  
    // 1. 移除 Markdown 代码块标记 (```json ... ```)
    t = t.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
  
    // 2. 移除可能导致解析失败的特殊控制字符，保留换行和制表符
    t = t.replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F]/g, "");
  
    // 3. 尝试找到 JSON 的起止点（防止 AI 在 JSON 前后说废话）
    const start = t.indexOf("{");
    const end = t.lastIndexOf("}");
    if (start >= 0 && end > start) {
      t = t.slice(start, end + 1);
    }
  
    // 4. 修复尾部逗号 (如: "key": "value", } -> "key": "value" })
    t = t.replace(/,\s*([}\]])/g, "$1");
  
    return t;
  }
  
  function safeParseJSON(text: string) {
    const cleanText = repairJSON(text);
    if (!cleanText) throw new Error("Empty JSON content after cleanup");
  
    try {
      return JSON.parse(cleanText);
    } catch (e: any) {
      // 如果还是失败，打印出来方便调试
      console.error("JSON Parse Error. Raw:", text.slice(0, 100), "Cleaned:", cleanText.slice(0, 100));
      throw new Error(`Invalid JSON format: ${e.message}`);
    }
  }
  
  export async function callGeminiJSON(
    system: string,
    user: string,
    opts: GeminiJSONOptions = {}
  ): Promise<any> {
    const apiKey = getEnv("GEMINI_API_KEY");
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
  
    const model = opts.model || getEnv("GEMINI_MODEL") || "gemini-2.0-flash"; // 建议用较新的模型
    const timeoutMs = opts.timeoutMs ?? 30000;
    const retries = opts.retries ?? 2;
    const temperature = opts.temperature ?? 0.7; // 稍微高一点更有“人味”
    const maxOutputTokens = opts.maxOutputTokens ?? 4096; // 必须够大
  
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
  
    const body = {
      contents: [{
        role: "user",
        parts: [{ text: `【SYSTEM】\n${system}\n\n【USER】\n${user}` }]
      }],
      generationConfig: {
        temperature,
        maxOutputTokens,
        responseMimeType: "application/json" // Gemini 原生支持 JSON 模式
      }
    };
  
    let lastErr: any = null;
  
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetchWithTimeout(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }, timeoutMs);
  
        const text = await res.text();
        
        if (!res.ok) {
          throw new Error(`Gemini API Error: ${res.status} ${text}`);
        }
  
        let jsonResp;
        try {
          jsonResp = JSON.parse(text);
        } catch {
          throw new Error("Gemini response is not valid JSON structure");
        }
  
        const contentText = extractTextFromGeminiResponse(jsonResp);
        return safeParseJSON(contentText);
  
      } catch (e: any) {
        lastErr = e;
        if (i < retries) await sleep(1000 * (i + 1));
      }
    }
  
    throw lastErr;
  }