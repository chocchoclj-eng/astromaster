// src/lib/rolePrompt.ts
import { ROLE_LIBRARY, type RoleId } from "./rolelibrary";
import type { RoleResult, ExplainItem } from "./roleEngine";

export function buildRolePolishPrompt(args: {
  roleResult: RoleResult;
  explains: ExplainItem[];
  userName?: string;
}) {
  const { roleResult, explains, userName } = args;

  const primary = ROLE_LIBRARY[roleResult.primaryRole];
  const secondary = roleResult.secondaryRoles.map((id) => ROLE_LIBRARY[id]);

  const explainSnippets = explains
    .map((x) => {
      const head = `${x.key}${x.sign ? `｜${x.sign}` : ""}${x.house ? `｜第${x.house}宫` : ""}`;
      const line = (x.oneLine || x.title || "").slice(0, 120);
      return `- ${head}：${line}`;
    })
    .slice(0, 18)
    .join("\n");

  return `
你是一位非常专业的占星师 + 人性策略顾问，擅长把“本命盘结构”翻译成可执行的职业建议。
注意：角色判定已经由系统规则引擎完成，你只能“润色与扩写”，绝对不允许更改角色结果或新增角色。

【用户】
${userName ? `昵称：${userName}\n` : ""}

【规则引擎已判定结果（不可修改）】
主角色：${primary.nameZh}（${primary.nameEn}）
次角色：${secondary.map((x) => `${x.nameZh}（${x.nameEn}）`).join("、") || "无"}
置信度：${roleResult.confidence}
风险提醒（固定主题，可改写语气但不能改变含义）：
${roleResult.warnings.map((w) => `- ${w}`).join("\n")}

【你可参考的星盘结构摘要（来自 astroExplain）】
${explainSnippets}

【输出要求】
请用中文输出，结构必须严格如下（不要加多余标题）：

1）一句话总评（<= 28 字）：像“使用说明书”的开头，克制、落地。
2）主角色说明：3 段，每段 2-3 句。分别讲：适合的位置/天然优势/容易踩坑。
3）次角色协同：2 段，每段 2-3 句。讲它如何辅助主角色，并给一个“组合用法”。
4）职业策略（可执行）：给 5 条，每条必须是动作句，以动词开头（例如：建立/减少/固定/选择/拒绝）。
5）风险护栏：把风险提醒改写成 3 条“规则”，每条以“如果…就…”格式输出。

强调：内容要具体，不要模板化；不要重复“长期项目/重复剧情”这种句式。
  `.trim();
}
