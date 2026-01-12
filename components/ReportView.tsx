import { useState } from "react";
import { ReportModuleCard } from "./ReportModuleCard";

export default function ReportView({ keyConfig }: { keyConfig: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        body: JSON.stringify({ keyConfig })
      });
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      {!data && !loading && (
        <button onClick={generate} className="w-full py-4 bg-indigo-600 rounded-xl text-white font-bold">
          开启深度解读报告
        </button>
      )}

      {loading && <div className="text-center text-slate-400 animate-pulse">AI 正在扫描星盘证据...</div>}

      {data && (
        <div className="space-y-8 pb-20">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl italic text-slate-300">
            “ {data.summary} ”
          </div>
          {data.modules.map((m: any) => (
            <ReportModuleCard key={m.id} module={m} />
          ))}
        </div>
      )}
    </div>
  );
}