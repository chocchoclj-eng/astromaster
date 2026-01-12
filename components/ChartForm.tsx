"use client";

import { useState } from "react";
import { MapPin, Clock, Sparkles, User, Calendar, Timer, Globe, ShieldCheck } from "lucide-react";

const UTC_OFFSETS = [
  "-12:00","-11:00","-10:00","-09:00","-08:00",
  "-07:00","-06:00","-05:00","-04:00","-03:00",
  "-02:00","-01:00","+00:00","+01:00","+02:00",
  "+03:00","+04:00","+05:00","+05:30","+06:00",
  "+07:00","+08:00","+09:00","+09:30","+10:00",
  "+11:00","+12:00","+13:00","+14:00",
];

function parseUtcOffsetToHours(s: string) {
  // s 形如 "+08:00" "-05:30"
  const m = /^([+-])(\d{2}):(\d{2})$/.exec((s || "").trim());
  if (!m) throw new Error("UTC 偏移格式错误");
  const sign = m[1] === "-" ? -1 : 1;
  const hh = Number(m[2]);
  const mm = Number(m[3]);
  return sign * (hh + mm / 60);
}

function splitBirth(birthDate: string, birthTime: string) {
  // birthDate: "1995-06-30" birthTime:"00:09"
  const [y, m, d] = birthDate.split("-").map((x) => Number(x));
  const [hh, mm] = birthTime.split(":").map((x) => Number(x));
  if (![y,m,d,hh,mm].every((n) => Number.isFinite(n))) throw new Error("日期/时间格式错误");
  return { y, m, d, hh, mm, ss: 0 };
}

export default function ChartForm({
  onCreated,
}: {
  onCreated: (args: { id: string; keyConfig: any }) => void;
}) {
  const [v, setV] = useState({
    name: "",
    birthDate: "2001-07-20",
    birthTime: "23:15",
    locationText: "上海",
    utcOffset: "+08:00",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const city = v.locationText.trim();
      if (!city) throw new Error("请输入出生地区");

      // 1) 地理解析：必须拿到 lat/lon
      const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(city)}`, { cache: "no-store" });
      const geo = await geoRes.json();
      if (!geoRes.ok || !geo?.ok) throw new Error(geo?.error || "无法识别该地区");

      const lat = geo?.place?.lat;
      const lon = geo?.place?.lon;
      if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) {
        throw new Error("地理解析失败：没有返回经纬度");
      }

      // 2) 时间拆解：转成 worker 需要的数字字段
      const { y, m, d, hh, mm, ss } = splitBirth(v.birthDate, v.birthTime);
      const tzOffsetHours = parseUtcOffsetToHours(v.utcOffset);

      // 3) 生成星盘：必须把 lat/lon 一起传
      const r = await fetch("/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: v.name.trim(),
          locationName: city,      // ✅ 统一字段名
          city,                    // ✅ 兼容
          lat: Number(lat),
          lon: Number(lon),
          tzOffsetHours,           // ✅ 数字
          y, m, d, hh, mm, ss,     // ✅ 数字
        }),
      });

      const data = await r.json();
      if (!r.ok || !data?.id || !data?.keyConfig) throw new Error(data?.error || "生成失败");

      onCreated({ id: data.id, keyConfig: data.keyConfig });
    } catch (e: any) {
      setErr(e?.message || "发生错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[540px] mx-auto bg-white rounded-[50px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] p-10 md:p-14 border border-gray-50">
      <div className="flex flex-col items-center mb-12">
        <div className="w-16 h-16 rounded-[22px] bg-white border border-gray-100 flex items-center justify-center mb-6 shadow-sm">
          <Sparkles size={32} className="text-gray-900" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">生成你的结构化本命盘</h1>
        <div className="mt-3 flex items-center gap-3 text-[13px] text-gray-400 font-medium">
          <span className="flex items-center gap-1.5"><Globe size={14} className="text-blue-500" /> 地区用于经纬度</span>
          <span className="w-px h-3 bg-gray-200" />
          <span className="flex items-center gap-1.5"><Clock size={14} className="text-amber-500" /> 时区用 UTC 偏移（手选更稳）</span>
        </div>
      </div>

      {err && (
        <div className="mb-10 p-5 rounded-[24px] bg-red-50/50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-3">
          <span className="text-red-500 font-bold text-lg leading-none">✕</span>
          <div className="space-y-1">
            <p className="text-[13px] leading-relaxed text-red-700 font-bold">Unexpected Error Occurred</p>
            <p className="text-[12px] text-red-600/80 leading-relaxed font-medium">{err}</p>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <div className="relative group">
          <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
          <input
            className="w-full h-16 bg-white border border-gray-200 rounded-[20px] pl-14 pr-6 outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all text-base font-semibold placeholder:text-gray-300"
            placeholder="昵称（可选）"
            value={v.name}
            onChange={(e) => setV({ ...v, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative group">
            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input
              type="date"
              className="w-full h-16 bg-white border border-gray-200 rounded-[20px] pl-14 pr-4 outline-none focus:border-black text-base font-semibold"
              value={v.birthDate}
              onChange={(e) => setV({ ...v, birthDate: e.target.value })}
              required
            />
          </div>
          <div className="relative group">
            <Timer className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input
              type="time"
              className="w-full h-16 bg-white border border-gray-200 rounded-[20px] pl-14 pr-4 outline-none focus:border-black text-base font-semibold"
              value={v.birthTime}
              onChange={(e) => setV({ ...v, birthTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="relative group">
          <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <input
            className="w-full h-16 bg-white border border-gray-200 rounded-[20px] pl-14 pr-6 outline-none focus:border-black text-base font-semibold placeholder:text-gray-300"
            placeholder="出生地区（例如：十堰）"
            value={v.locationText}
            onChange={(e) => setV({ ...v, locationText: e.target.value })}
            required
          />
        </div>

        <div className="relative group">
          <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <select
            className="w-full h-16 bg-white border border-gray-200 rounded-[20px] pl-14 pr-10 outline-none focus:border-black text-base font-semibold appearance-none cursor-pointer"
            value={v.utcOffset}
            onChange={(e) => setV({ ...v, utcOffset: e.target.value })}
          >
            {UTC_OFFSETS.map((x) => (
              <option key={x} value={x}>UTC {x}</option>
            ))}
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-black text-white h-20 rounded-[24px] font-black text-lg shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-50 mt-6 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              <span>计算星盘数据中...</span>
            </>
          ) : (
            <span>生成报告 🚀</span>
          )}
        </button>

        <div className="text-center mt-10">
          <p className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 font-bold bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <ShieldCheck size={14} className="text-emerald-500" />
            地理数据在服务端解析，隐私安全保障中
          </p>
        </div>
      </form>
    </div>
  );
}
