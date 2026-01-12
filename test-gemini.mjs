import "dotenv/config";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("❌ 没有设置 GEMINI_API_KEY / GOOGLE_API_KEY");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      });
          const result = await model.generateContent("用一句话介绍你自己");
    console.log("✅ Gemini 返回成功：");
    console.log(result.response.text());
  } catch (e) {
    console.error("❌ Gemini 调用失败：");
    console.error(e?.message || e);
  }
}

test();
