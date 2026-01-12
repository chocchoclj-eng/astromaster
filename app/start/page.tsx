"use client";

import { useRouter } from "next/navigation";

export default function StartPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#07070a] text-white px-6 py-14">
      {/* 背景气氛 */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 opacity-70 [background:radial-gradient(60%_45%_at_50%_0%,rgba(255,255,255,0.12),rgba(0,0,0,0))]" />
        <div className="absolute -top-32 left-1/2 h-96 w-[640px] -translate-x-1/2 blur-3xl opacity-25 [background:radial-gradient(circle,rgba(245,208,115,0.55),rgba(0,0,0,0))]" />
        <div className="absolute bottom-0 left-0 right-0 h-48 opacity-70 [background:linear-gradient(to_top,rgba(0,0,0,0.9),rgba(0,0,0,0))]" />
      </div>

      <div className="relative mx-auto w-full max-w-4xl">
        {/* 顶部标识 */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 backdrop-blur">
            <span>Astrology</span>
            <span className="opacity-40">×</span>
            <span>AI</span>
            <span className="opacity-40">·</span>
            <span>人格结构分析</span>
          </div>
        </div>

        {/* Hero 区 */}
        <header className="mt-12 text-center">
          {/* 金色功能标签 */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f5d073]/25 bg-[#f5d073]/10 px-4 py-1.5 text-xs text-[#f5d073]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#f5d073]" />
              结构化解盘 · 可执行建议 · 3 分钟生成
            </div>
          </div>

          {/* 主标题（居中、大字号、纯白） */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-tight text-white">
            灵魂结构说明书
          </h1>

          {/* 金色强调线（居中） */}
          <div className="mx-auto mt-5 h-[2px] w-36 md:w-44 rounded-full bg-[#f5d073]/80" />

          {/* 副标题 */}
          <p className="mt-6 text-sm md:text-base text-white/70 leading-relaxed">
            用本命盘还原你的{" "}
            <span className="text-white/90 font-medium bg-[#f5d073]/10 border border-[#f5d073]/20 px-2 py-0.5 rounded-md">
              原生出厂设置
            </span>
            ，
            <br />
            把性格结构与潜在盲点，翻译成{" "}
            <span className="text-white/90 font-medium bg-[#f5d073]/10 border border-[#f5d073]/20 px-2 py-0.5 rounded-md">
              可执行的生活与决策建议
            </span>
            。
          </p>

          {/* 你会得到什么 */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Pill>职业策略</Pill>
            <Pill>关系边界</Pill>
            <Pill>财富与风险偏好</Pill>
            <Pill>日常决策操作系统</Pill>
          </div>
        </header>

        {/* 方法论 */}
        <section className="mt-12 grid gap-4">
          <MethodCard
            idx="01"
            title="以占星作为底层人格结构"
            desc="通过 太阳 / 月亮 / 上升 / 宫位 / 相位，还原你长期稳定的性格运行逻辑。"
          />
          <MethodCard
            idx="02"
            title="用 AI 把结构翻译成行动"
            desc="转化为职业策略、关系边界、财富与风险偏好，以及你日常做决定的习惯方式。"
          />
          <MethodCard
            idx="03"
            title="帮你更准确地使用自己"
            desc="知道优势怎么用、短板怎么补，以及在哪些场景最容易卡住或被消耗。"
          />
        </section>

        {/* 引言 */}
        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="text-xs text-white/55 mb-3">📘 灵魂结构说明书 · 引言</div>

          <p className="text-base md:text-lg text-white/85 leading-relaxed">
            你不是不够努力，也不是方向感差。
          </p>

          <p className="mt-3 text-sm md:text-base text-white/70 leading-relaxed">
            很多时候，只是因为你从来没有被认真地告诉过：
            你是怎样的结构、你适合站在什么位置、你在哪些地方会被反复消耗。
          </p>

          <p className="mt-4 text-sm md:text-base text-white/70 leading-relaxed">
            这不是命运，而是一份{" "}
            <span className="text-white/90 font-medium">使用说明书</span>。
          </p>
        </section>

        {/* CTA */}
        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 backdrop-blur">
          <button
            onClick={() => router.push("/start/form")}
            className="w-full h-14 rounded-2xl bg-white text-black font-semibold text-base shadow-[0_20px_40px_-18px_rgba(255,255,255,0.35)] hover:scale-[0.99] active:scale-[0.98] transition"
          >
            继续填写出生信息（3 分钟生成）
          </button>

          <div className="mt-3 text-center text-xs text-white/45">
            你的出生信息仅用于生成个人报告，不用于训练模型。
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-white/35">
          © SOUL CONFIG · Structure First
        </footer>
      </div>
    </main>
  );
}

/* ---------- 子组件 ---------- */

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

function MethodCard({
  idx,
  title,
  desc,
}: {
  idx: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="flex items-start gap-4">
        <div className="shrink-0 rounded-xl border border-[#f5d073]/25 bg-[#f5d073]/10 px-3 py-2 text-xs text-[#f5d073] font-semibold">
          {idx}
        </div>
        <div>
          <div className="text-sm md:text-base font-semibold text-white/90">
            {title}
          </div>
          <div className="mt-2 text-sm text-white/70 leading-relaxed">
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}
