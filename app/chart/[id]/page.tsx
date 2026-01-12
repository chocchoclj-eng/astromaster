"use client";
import { useEffect, useState } from "react";
import ReportView from "@/components/ReportView"; // 确保路径正确

export default function ChartPage({ params }: { params: { id: string } }) {
  const [keyConfig, setKeyConfig] = useState(null);

  useEffect(() => {
    // 1. 先从后端读取已经算好的星盘基础数据
    fetch(`/api/chart?id=${params.id}`)
      .then(res => res.json())
      .then(data => setKeyConfig(data.keyConfig));
  }, [params.id]);

  if (!keyConfig) return <div className="text-white">加载星盘中...</div>;

  return (
    <div className="min-h-screen bg-black py-10">
      {/* 你的星盘圆盘组件可以放在这里 */}
      
      <div className="mt-12">
        <h2 className="text-center text-2xl font-bold text-white mb-8">深度解读报告</h2>
        {/* ✅ 传入 keyConfig，ReportView 内部会处理按钮点击和 API 请求 */}
        <ReportView keyConfig={keyConfig} />
      </div>
    </div>
  );
}