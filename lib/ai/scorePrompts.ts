// lib/ai/scorePrompts.ts
type Kind = "overview" | "domain" | "trait" | "nsv";

export type AIBlock = {
  title: string;
  scoreMeaning: string;
  sections: { key: string; title: string; text: string }[];
  evidenceUsed?: string[];
};

function safeJson(x: any) {
  try { return JSON.stringify(x ?? {}, null, 2); } catch { return "{}"; }
}

const BASE_SYSTEM = `
你是一位精通行为动力学与进化占星学的顶级专家。你负责解读基于星盘精准计算的性格评估报告。
【核心输出规则】
1. 必须输出严格 JSON，不要包含 Markdown 标记（如 ** 或 ###）。
2. 严禁凭空编造：所有结论必须基于提供的 payload.evidence 或支持数据。
3. 占星证据论证：解析中必须提到支持该结论的行星、相位或宫位，并解释其在心理层面的运作逻辑。
4. 两极视角：在频谱（Spectrum）解读中，数值代表倾向而非优劣。
5. 独特性解释：Percentile（人群百分位）代表该特质在人群中的稀有度。Top 5% 代表极度鲜明或极端，Top 50% 代表中轴大众。

【统一输出结构】
{
  "title": "风格定位标题 (15字内)",
  "scoreMeaning": "核心倾向的两句话总结（包含人群排位含义）",
  "sections": [
    { "key": "reality", "title": "本能路径", "text": "描述进入该场域/处理特质时的本能反应，必须引用星盘相位进行论证。" },
    { "key": "dynamic", "title": "运作机制", "text": "描述这种能量如何驱动你的行为，指出其在潜意识层面的拉扯。" },
    { "key": "risk", "title": "潜在盲点", "text": "指出在该场域最容易失手、翻车或产生内耗的环节。" },
    { "key": "advice", "title": "进化建议", "text": "给出一个具体的、流程化的行为规章建议。" }
  ],
  "evidenceUsed": []
}
`.trim();

function buildDomainUser(payload: any) {
  const key = String(payload?.key || "");
  const ev = payload?.domainEvidence || payload?.evidence || {};
  
  const perspectives: Record<string, string> = {
    Love: "判断视角：关注进入关系的方式、对安全感的定义、容易翻车的摩擦点、适配的人群特质。",
    Career: "判断视角：事业驱动类型（创意/执行/系统/连接驱动）、适配的工作结构、决策推进风格。",
    Investment: "判断视角：不确定性下的情绪决策逻辑、最容易失手的环节（如：止损/冲动/过度防御）、流程建议。",
    Resilience: "判断视角：压力下的本能防御机制、心理能量的修复来源、高压下的行为变形风险。"
  };

  return `
请深度解析【${key}】生命场域。
${perspectives[key] || "判断视角：关注该场域的本能路径、运作动力与风险平衡。"}

【星盘论证证据】
${safeJson(ev)}

【人群数据参考】
该用户在该领域的排位：Top ${payload.percentile || "未知"}% (数值越小代表特质越极端)。
`.trim();
}

export function buildScorePrompt(args: { kind: Kind; payload: any }) {
  const { kind, payload } = args;
  let user = "";

  if (kind === "domain") {
    user = buildDomainUser(payload);
  } else if (payload.subtype === "spectrum") {
    user = `
请解析性格频谱：${payload.title}。
两极：左侧[${payload.leftLabel}] ↔ 右侧[${payload.rightLabel}]。
当前倾向值：${payload.value.toFixed(1)}（0偏左，100偏右，50中性）。
人群位置：Top ${payload.percentile || "未知"}%。
论证证据：${safeJson(payload.evidence)}
`.trim();
  } else if (kind === "overview") {
    user = `请基于以下各维度数据生成能量综述报告：${safeJson(payload)}`;
  } else {
    user = `深度解析 NSV 压力模式：${safeJson(payload.nsv || payload)}`;
  }

  return { system: BASE_SYSTEM, user };
}