// app/api/chart/route.ts
import { NextResponse } from "next/server";
import path from "path";

// ✅ 强制 Node runtime（Vercel 才能跑 native）
export const runtime = "nodejs";

// ✅ sweph 在 TS 下的导入兼容写法（你本地 require OK，这里用 default）
import swephPkg from "sweph";
const sweph: any = swephPkg;

type ChartInput = {
  y: number;
  m: number;
  d: number;
  hh: number;
  mm: number;
  ss: number;
  tzOffsetHours: number; // 例如 上海 +8 就传 8
  lat: number;
  lon: number;
};

function norm(x: number) {
  return ((x % 360) + 360) % 360;
}

function localToUTC(y: number, m: number, d: number, hh: number, mm: number, ss: number, tz: number) {
  const dt = new Date(Date.UTC(y, m - 1, d, hh - tz, mm, ss));
  return {
    y: dt.getUTCFullYear(),
    m: dt.getUTCMonth() + 1,
    d: dt.getUTCDate(),
    hh: dt.getUTCHours(),
    mm: dt.getUTCMinutes(),
    ss: dt.getUTCSeconds(),
  };
}

function utcToJdUt(utc: { y: number; m: number; d: number; hh: number; mm: number; ss: number }) {
  const r = sweph.utc_to_jd(utc.y, utc.m, utc.d, utc.hh, utc.mm, utc.ss, 1);
  if (r.flag !== 0) throw new Error(r.error || "utc_to_jd failed");
  return { jd_et: r.data[0], jd_ut: r.data[1] };
}

function getHousesKoch(jd_ut: number, lat: number, lon: number) {
  const h = sweph.houses(jd_ut, lat, lon, "K");
  if (h.flag !== 0) throw new Error("houses failed");
  return {
    cusps: h.data.houses.map(norm),
    points: h.data.points.map(norm),
  };
}

function houseOf(lon: number, cusps: number[]) {
  lon = norm(lon);
  const start = cusps[0];
  const n = (x: number) => norm(x - start);
  const lonN = n(lon);
  const c = cusps.map(n);
  for (let i = 0; i < 12; i++) {
    const a = c[i];
    const b = i === 11 ? 360 : c[i + 1];
    if (lonN >= a && lonN < b) return i + 1;
  }
  return 12;
}

function dms(lon: number) {
  lon = norm(lon);
  const sign = Math.floor(lon / 30);
  const d = lon - sign * 30;
  const deg = Math.floor(d);
  const min = Math.floor((d - deg) * 60);
  return { sign, deg, min };
}

function calcBody(jd_ut: number, id: number) {
  const FLAG = (sweph.FLG_MOSEPH ?? 0) | (sweph.FLG_SPEED ?? 0);
  const r = sweph.calc_ut(jd_ut, Number(id), FLAG);

  // 找不到 sepl_18.se1 时，SwissEph 会 fallback 到 Moshier，这是正常的
  const msg = String(r.error || "");
  if (r.flag !== 0 && !msg.includes("Moshier")) {
    throw new Error(r.error || "calc_ut failed");
  }

  return {
    lon: norm(r.data[0]),
    lat: r.data[1],
    speed: r.data[3],
  };
}

function calcChartKoch(input: ChartInput) {
  // ✅ 你 worker 里用的是项目根目录 /ephe
  // 你要保证这个 ephe 文件夹在仓库里，并被部署带上（别被 .gitignore 掉）
  // 如果你没有 ephe 文件夹：也能跑（会 Moshier fallback），但精度/一致性可能不同
  sweph.set_ephe_path(process.env.SWE_EPH_PATH || path.join(process.cwd(), "ephe"));

  const utc = localToUTC(input.y, input.m, input.d, input.hh, input.mm, input.ss, input.tzOffsetHours);
  const { jd_ut } = utcToJdUt(utc);
  const { cusps, points } = getHousesKoch(jd_ut, input.lat, input.lon);

  const ASC = points[0];
  const MC = points[1];

  // Swiss Ephemeris body IDs
  const bodiesMap: Record<string, number> = {
    Sun: 0,
    Moon: 1,
    Mercury: 2,
    Venus: 3,
    Mars: 4,
    Jupiter: 5,
    Saturn: 6,
    Uranus: 7,
    Neptune: 8,
    Pluto: 9,
    TrueNode: 11, // TRUE NODE
  };

  const bodies: Record<string, any> = {};
  for (const [name, id] of Object.entries(bodiesMap)) {
    const p = calcBody(jd_ut, id);

    if (name === "TrueNode") {
      const north = p.lon;
      const south = norm(north + 180);
      bodies["TrueNode_North"] = { lon: north, house: houseOf(north, cusps), ...dms(north) };
      bodies["TrueNode_South"] = { lon: south, house: houseOf(south, cusps), ...dms(south) };
    } else {
      bodies[name] = { ...p, house: houseOf(p.lon, cusps), ...dms(p.lon) };
    }
  }

  return {
    meta: {
      zodiac: "tropical",
      houseSystem: "K",
      node: "true",
      center: "geocentric",
      ephemeris: "swiss",
      jd_ut,
      utc,
      location: { lat: input.lat, lon: input.lon },
    },
    angles: { ASC, MC },
    houses: { cusps },
    bodies,
  };
}

export async function POST(req: Request) {
  try {
    const input = (await req.json()) as ChartInput;

    // 简单校验
    for (const k of ["y", "m", "d", "hh", "mm", "ss", "tzOffsetHours", "lat", "lon"] as const) {
      if (typeof input[k] !== "number") {
        return NextResponse.json({ ok: false, error: `Missing/invalid ${k}` }, { status: 400 });
      }
    }

    const result = calcChartKoch(input);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error("CHART API ERROR:", e);
    return NextResponse.json({ ok: false, error: e?.message || "Chart API failed" }, { status: 500 });
  }
}