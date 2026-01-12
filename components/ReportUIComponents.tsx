// components/ReportUIComponents.tsx
import React from "react";

// 高级感容器卡片：超大圆角与柔和投影
export function ReportCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[40px] border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-md ${className}`}>
      {children}
    </div>
  );
}

// 药丸标签
export function ReportPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/70 shadow-sm">
      {children}
    </span>
  );
}

// 模块标题组件
export function SectionHeader({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: string }) {
  return (
    <div className="mb-6 space-y-1 px-4">
      <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
        {icon && <span>{icon}</span>} {title}
      </h2>
      {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
    </div>
  );
}