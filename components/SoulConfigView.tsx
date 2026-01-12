// components/SoulConfigView.tsx
"use client";

import React, { useMemo } from 'react';
import { inferRolesFromExplain } from '@/lib/roleEngine';
import { ROLE_LIBRARY } from '@/lib/rolelibrary';
import { ReportCard } from './ReportUIComponents';
import { Target, ShieldAlert, Sparkles, Zap } from 'lucide-react';

export default function SoulConfigView({ keyConfig }: { keyConfig: any }) {
  // 使用你写的引擎自动判定角色
  const result = useMemo(() => 
    inferRolesFromExplain(keyConfig.humanSummary || []), 
    [keyConfig]
  );

  const primaryRole = ROLE_LIBRARY[result.primaryRole];
  const secondaryRoles = result.secondaryRoles.map(id => ROLE_LIBRARY[id]);

  return (
    <div className="space-y-12">
      {/* 头部：职业灵魂画像 */}
      <section className="text-center py-10">
        <h2 className="text-indigo-400 text-xs font-black tracking-[0.3em] uppercase mb-4">
          Soul Configuration / 职业灵魂配置
        </h2>
        <div className="text-3xl font-bold text-white tracking-tight">
          你是一台天生的 <span className="text-indigo-400">“{primaryRole.nameZh}”</span>
        </div>
      </section>

      {/* 主卡片：核心能力栈 */}
      <ReportCard className="border-indigo-500/20 bg-indigo-500/5">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
            <Target size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold">{primaryRole.nameZh}</h3>
            <p className="text-xs text-white/40 uppercase tracking-widest">{primaryRole.nameEn}</p>
          </div>
        </div>

        <p className="text-lg text-gray-300 leading-relaxed mb-8 italic pl-6 border-l-2 border-indigo-500/50">
          “{primaryRole.summary}”
        </p>

        <div className="grid gap-4">
          {primaryRole.bullets.map((b, i) => (
            <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-indigo-500 font-mono font-bold">0{i+1}</span>
              <p className="text-sm text-gray-400 leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </ReportCard>

      {/* 次要角色与避坑指南 */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-xs font-bold text-white/40 px-4 uppercase tracking-widest">
            <Sparkles size={14} className="text-yellow-500" /> 协同天赋
          </h4>
          {secondaryRoles.map(role => (
            <div key={role.id} className="p-6 rounded-[32px] bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
              <div className="font-bold text-white mb-1">{role.nameZh}</div>
              <p className="text-xs text-white/40 leading-relaxed">{role.summary}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-xs font-bold text-white/40 px-4 uppercase tracking-widest">
            <ShieldAlert size={14} className="text-red-500" /> 风险预警
          </h4>
          <div className="p-6 rounded-[32px] bg-red-500/5 border border-red-500/10">
            {result.warnings.map((w, i) => (
              <div key={i} className="mb-4 last:mb-0 flex gap-3">
                <Zap size={14} className="text-red-500 mt-1 shrink-0" />
                <p className="text-xs text-red-200/60 leading-relaxed">{w}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}