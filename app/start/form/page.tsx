"use client";

import ChartForm from "@/components/ChartForm";
import { useRouter } from "next/navigation";

export default function StartFormPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white text-slate-900 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="text-sm text-slate-500">开始生成</div>
          <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
            填写出生信息
          </h1>
          <p className="mt-3 text-sm md:text-base text-slate-600">
            出生地区用于经纬度，时区建议使用 UTC 偏移（手选更稳）。
          </p>
        </div>

        <div className="flex justify-center">
          <ChartForm
            onCreated={({ id }) => {
              router.push(`/report/${id}`);
            }}
          />
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          本工具用于自我探索与学习用途，不替代医疗、心理、法律或金融建议。
        </div>
      </div>
    </main>
  );
}
