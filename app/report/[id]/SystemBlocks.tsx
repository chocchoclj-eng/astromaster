"use client";

import React, { useMemo, useState } from "react";
import { X, Sparkles, AlertTriangle } from "lucide-react";
import type { CareerTag, TagScore } from "@/lib/career/careerEngine";

// 你系统里的 tag → 模块名/一句话/双面性
const MODULE_META: Record<
  CareerTag,
  {
    title: string;
    subtitle: string;
    positive: string[];
    overload: string[];
    use: string[];
  }
> = {
  Communication: {
    title: "表达模块",
    subtitle: "把复杂讲清楚",
    positive: ["信息组织快", "表达有感染力", "连接资源能力强"],
    overload: ["信息过载/分心", "说太多但落地少", "为了回应而耗能"],
    use: ["先结论后理由", "每次只推进一个目标", "把输出变模板/SOP"],
  },
  Leadership: {
    title: "决策模块",
    subtitle: "推进与承担",
    positive: ["敢拍板", "能扛责任", "关键时刻推进局面"],
    overload: ["急推进导致误伤", "被期待绑架", "压力下变强硬"],
    use: ["先写清底线", "把权责写到规则里", "决定前做一次反证"],
  },
  Strategy: {
    title: "战略模块",
    subtitle: "框架与路径",
    positive: ["能看结构", "会拆解路径", "擅长做取舍"],
    overload: ["想太多拖慢行动", "沉迷框架忽略现实反馈", "追求完美路线"],
    use: ["先做60分验证", "用数据校准假设", "每周复盘一次结构假设"],
  },
  ResearchDeepWork: {
    title: "深度模块",
    subtitle: "洞察与真相",
    positive: ["洞察强", "能钻深水区", "能把问题看穿"],
    overload: ["过度怀疑/消耗", "卡在“还不够确定”", "容易陷入强控制"],
    use: ["设定研究边界", "输出可验证结论", "把深度变成决策武器"],
  },
  CommunityNetwork: {
    title: "网络模块",
    subtitle: "社群与平台",
    positive: ["人脉放大", "资源连接快", "能利用平台效应"],
    overload: ["关系耗损", "被社交拖住产出", "关系浅而散"],
    use: ["只维护Top关系", "建立合作模板", "用规则替代情绪劳动"],
  },
  PublicInfluence: {
    title: "影响力模块",
    subtitle: "被看见与信用",
    positive: ["容易获得关注", "擅长建立公众叙事", "信用可复利"],
    overload: ["形象焦虑", "曝光消耗", "被评价牵引决策"],
    use: ["让成果说话", "减少解释，增加交付", "给自己固定输出节奏"],
  },
  MoneyAssets: {
    title: "资产模块",
    subtitle: "定价与资源",
    positive: ["价值感强", "会定价", "能做资源配置"],
    overload: ["过度关注得失", "把价值感绑在结果上", "容易焦虑"],
    use: ["分清资产与情绪", "建立仓位/预算规则", "用系统保现金流"],
  },
  RiskFinance: {
    title: "风险模块",
    subtitle: "深水区博弈",
    positive: ["敢做不确定决策", "理解赔率/博弈", "能抓窗口期"],
    overload: ["情绪加码", "一次错误清空", "把风险当成刺激"],
    use: ["仓位上限+退出规则", "先验证再放大", "胜利后先回收"],
  },
  ManagementSystems: {
    title: "系统模块",
    subtitle: "流程与复利",
    positive: ["能搭系统", "稳定交付", "长期复利能力强"],
    overload: ["稳定但无跃迁", "过度优化细节", "把自己当机器"],
    use: ["里程碑而非完美", "给系统一个放大点", "定期对外可见成果"],
  },
  ServiceOps: {
    title: "执行模块",
    subtitle: "日常与运营",
    positive: ["抗压执行", "流程感强", "能把事跑顺"],
    overload: ["忙但不产出", "变成救火队", "长期消耗能量"],
    use: ["减少救火：设边界", "做可重复流程", "把交付沉淀为资产"],
  },
  Innovation: {
    title: "破局模块",
    subtitle: "新玩法与试验",
    positive: ["敢创新", "快迭代", "能在无共识期领先"],
    overload: ["频繁换方向", "旧系统没收尾", "刺激依赖"],
    use: ["先小实验再all-in", "变化做成可控实验", "每次切换都要收尾"],
  },
  ProductBuilder: {
    title: "构建模块",
    subtitle: "产品与落地",
    positive: ["能搭东西", "能把想法做成产品", "具备交付闭环"],
    overload: ["全靠自己硬扛", "过度投入细节", "容易忽略市场反馈"],
    use: ["先交付最小闭环", "快速拿反馈", "让产品承接影响力"],
  },
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-[36px] border border-white/10 bg-[#0A0B14] shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-white font-black tracking-tight">{title}</div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 inline-flex items-center gap-2"
          >
            <X size={14} /> 关闭
          </button>
        </div>
        <div className="p-6 max-h-[72vh] overflow-auto custom-scrollbar">{children}</div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.35); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}

export function SystemBlocks({
  tagScores,
  limit = 6,
}: {
  tagScores: TagScore[];
  limit?: number;
}) {
  const [picked, setPicked] = useState<CareerTag | null>(null);

  const blocks = useMemo(() => {
    const sorted = [...tagScores]
      .filter((x) => !!MODULE_META[x.tag])
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const max = Math.max(1, ...sorted.map((x) => x.score));

    return sorted.map((x) => {
      const t = clamp01(x.score / max);
      // 用 1~3 档大小，不做“好坏”，只做“存在感”
      const span = t > 0.75 ? 3 : t > 0.45 ? 2 : 1;
      return { ...x, t, span };
    });
  }, [tagScores, limit]);

  const active = picked ? MODULE_META[picked] : null;

  return (
    <>
      <div className="rounded-[40px] border border-white/10 bg-black/30 p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black text-white/60 uppercase tracking-widest">
              SYSTEM BLOCKS / 人格模块拼装
            </div>
            <div className="mt-2 text-sm text-white/60">
              点击模块查看「正向用法 / 过量副作用 / 使用建议」
            </div>
          </div>
          <div className="shrink-0 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
            <Sparkles size={14} /> Structure Reveal
          </div>
        </div>

        <div className="mt-6 grid grid-cols-6 gap-4">
          {blocks.map((b) => {
            const meta = MODULE_META[b.tag];
            const colSpan = b.span >= 3 ? "col-span-3" : b.span === 2 ? "col-span-2" : "col-span-1";
            const height = b.span >= 3 ? "h-[168px]" : b.span === 2 ? "h-[140px]" : "h-[120px]";

            return (
              <button
                key={b.tag}
                onClick={() => setPicked(b.tag)}
                className={[
                  colSpan,
                  height,
                  "group relative rounded-[28px] border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] transition-all p-5 text-left overflow-hidden",
                ].join(" ")}
              >
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl" />
                <div className="relative z-10">
                  <div className="text-xs font-mono text-white/35 uppercase tracking-widest">
                    {b.tag}
                  </div>
                  <div className="mt-2 text-xl font-black text-white group-hover:text-indigo-300 transition-colors">
                    {meta.title}
                  </div>
                  <div className="mt-2 text-sm text-white/60">
                    {meta.subtitle}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-2.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500/60"
                        style={{ width: `${Math.round(b.t * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs font-mono text-white/50">
                      {b.score.toFixed(1)}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-white/45">
                    点击查看双面性 →
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Modal
        open={!!picked}
        title={picked ? `${MODULE_META[picked].title}（${picked}）` : ""}
        onClose={() => setPicked(null)}
      >
        {picked && active ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
              <div className="text-xs font-black uppercase tracking-widest text-white/60">
                模块说明
              </div>
              <div className="mt-3 text-lg text-white">
                {active.subtitle}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                <div className="text-xs font-black uppercase tracking-widest text-emerald-300">
                  ✔ 正向用法
                </div>
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  {active.positive.map((x) => (
                    <li key={x}>• {x}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6">
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-300">
                  <AlertTriangle size={14} /> 过量副作用
                </div>
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  {active.overload.map((x) => (
                    <li key={x}>• {x}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-6">
              <div className="text-xs font-black uppercase tracking-widest text-indigo-200">
                可执行建议
              </div>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                {active.use.map((x) => (
                  <li key={x}>• {x}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}