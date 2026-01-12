import ReactMarkdown from "react-markdown";

export function ReportModuleCard({ module }: { module: any }) {
  // 根据 ID 定制 UI 样式
  const getStyle = (id: number) => {
    switch (id) {
      case 1: return { icon: "🏛️", border: "border-blue-500/30", bg: "bg-blue-500/5", accent: "text-blue-400" };
      case 2: return { icon: "🔥", border: "border-orange-500/30", bg: "bg-orange-500/5", accent: "text-orange-400" };
      case 3: return { icon: "🌓", border: "border-purple-500/30", bg: "bg-purple-500/5", accent: "text-purple-400" };
      case 4: return { icon: "🧱", border: "border-gray-500/50", bg: "bg-gray-500/10", accent: "text-gray-400" };
      case 5: return { icon: "⚡", border: "border-cyan-500/30", bg: "bg-cyan-500/5", accent: "text-cyan-400" };
      case 6: return { icon: "☸️", border: "border-yellow-500/30", bg: "bg-yellow-500/5", accent: "text-yellow-400" };
      default: return { icon: "✨", border: "border-slate-800", bg: "bg-slate-900", accent: "text-white" };
    }
  };

  const s = getStyle(module.id);

  return (
    <div className={`relative border-l-4 ${s.border} ${s.bg} p-6 rounded-r-2xl mb-6 shadow-xl`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{s.icon}</span>
          <h3 className={`text-xl font-bold ${s.accent}`}>{module.title}</h3>
        </div>
        <div className="flex gap-2">
          {module.tags?.map((tag: string) => (
            <span key={tag} className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500">#{tag}</span>
          ))}
        </div>
      </div>
      <div className="prose prose-invert prose-sm max-w-none">
        <ReactMarkdown>{module.content}</ReactMarkdown>
      </div>
    </div>
  );
}