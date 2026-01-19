// app/api/chart/route.ts
import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { createRequire } from "node:module";

export const runtime = "nodejs";

// ✅ 运行时加载 native addon，绕过 Next bundler 对 .node 的解析
function getSweph() {
  const g = globalThis as any;
  if (g.__SWE__) return g.__SWE__;
  const require = createRequire(import.meta.url);
  g.__SWE__ = require("sweph");
  return g.__SWE__;
}

// ✅ Vercel Serverless: 只有 /tmp 可写（临时）
const STORE_DIR = "/tmp/charts";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function genId() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = globalThis.crypto;
  return c?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
async function ensureStore() {
  await fs.mkdir(STORE_DIR, { recursive: true });
}
async function saveChart(id: string, chart: any) {
  await ensureStore();
  const file = path.join(STORE_DIR, `${id}.json`);
  await fs.writeFile(file, JSON.stringify(chart, null, 2), "utf8");
}
async function loadChart(id: string) {
  const file = path.join(STORE_DIR, `${id}.json`);
  const txt = await fs.readFile(file, "utf8");
  return JSON.parse(txt);
}

function mustNum(v: any, name: string) {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`Missing/invalid ${name}`);
  return n;
}

function buildInput(params: any) {
  const y = mustNum(params.y, "y");
  const m = mustNum(params.m, "m");
  const d = mustNum(params.d, "d");
  const hh = mustNum(params.hh, "hh");
  const mm = mustNum(params.mm, "mm");
  const ss = Number.isFinite(Number(params.ss)) ? Number(params.ss) : 0;

  const tzOffsetHours = mustNum(params.tzOffsetHours ?? params.tz, "tzOffsetHours");
  const lat = mustNum(params.lat, "lat");
  const lon = mustNum(params.lon, "lon");

  // ✅ 临时存储路径下 city/展示字段可空
  const locationName = String(params.locationName ?? params.city ?? "").trim() || "—";
  const name = String(params.name ?? "").trim();

  return { y, m, d, hh, mm, ss, tzOffsetHours, lat, lon, locationName, name };
}

function hoursToUtcOffsetStr(h: number) {
  const sign = h < 0 ? "-" : "+";
  const abs = Math.abs(h);
  const hh = Math.floor(abs);
  const mm = Math.round((abs - hh) * 60);
  return `${sign}${pad2(hh)}:${pad2(mm)}`;
}
function inputToLocalBirthDateTime(input: any) {
  return `${input.y}-${pad2(input.m)}-${pad2(input.d)}T${pad2(input.hh)}:${pad2(input.mm)}:${pad2(input.ss)}`;
}

/** ====== sweph 同步算盘（替代 worker） ====== */

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
  const sweph = getSweph();
  const r = sweph.utc_to_jd(utc.y, utc.m, utc.d, utc.hh, utc.mm, utc.ss, 1);
  if (r.flag !== 0) throw new Error(r.error || "utc_to_jd failed");
  return { jd_et: r.data[0], jd_ut: r.data[1] };
}

function getHousesKoch(jd_ut: number, lat: number, lon: number) {
  const sweph = getSweph();
  const h = sweph.houses(jd_ut, lat, lon, "K");
  if (h.flag !== 0) throw new Error("houses failed");
  return {
    cusps: h.data.houses.map(norm),
    points: h.data.points.map(norm), // points[0]=ASC, points[1]=MC
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
  const sweph = getSweph();
  const FLAG = (sweph.FLG_MOSEPH ?? 0) | (sweph.FLG_SPEED ?? 0);
  const r = sweph.calc_ut(jd_ut, Number(id), FLAG);

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

async function calcChartSync(input: any) {
  const sweph = getSweph();
  sweph.set_ephe_path(process.env.SWE_EPH_PATH || path.join(process.cwd(), "ephe"));

  const utc = localToUTC(input.y, input.m, input.d, input.hh, input.mm, input.ss, input.tzOffsetHours);
  const { jd_ut } = utcToJdUt(utc);

  const { cusps, points } = getHousesKoch(jd_ut, input.lat, input.lon);

  const ASC = points[0];
  const MC = points[1];

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
    TrueNode: 11,
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

/** ===== chart -> keyConfig 适配（用于你现有 ReportClient/Live） ===== */

const SIGNS_ZH = ["白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼"];
function norm360(x: number) {
  return ((x % 360) + 360) % 360;
}
function lonToSign(lon: number) {
  const x = norm360(lon);
  const si = Math.floor(x / 30);
  const d = x - si * 30;
  const deg = Math.floor(d);
  const min = Math.floor((d - deg) * 60);
  return { lon: x, sign: SIGNS_ZH[si], deg, min };
}

function chartToKeyConfig(chart: any) {
  const metaInput = chart?.meta?.input || {};
  const tzOffsetHours = Number(metaInput?.tzOffsetHours ?? chart?.meta?.tzOffsetHours ?? 0);

  const ascLon = Number(chart?.angles?.ASC);
  const mcLon = Number(chart?.angles?.MC);

  const asc = Number.isFinite(ascLon) ? { ...lonToSign(ascLon), house: 1 } : null;
  const mc = Number.isFinite(mcLon) ? { ...lonToSign(mcLon), house: 10 } : null;

  const b = chart?.bodies || {};
  const mk = (src: any) => {
    if (!src) return null;
    const lon = Number(src.lon);
    if (!Number.isFinite(lon)) return null;
    return { ...lonToSign(lon), house: Number(src.house ?? 0) };
  };

  const planets: any[] = [];
  const push = (name: string, src: any) => {
    const x = mk(src);
    if (!x) return;
    planets.push({ body: name, ...x });
  };

  push("Sun", b.Sun);
  push("Moon", b.Moon);
  push("Mercury", b.Mercury);
  push("Venus", b.Venus);
  push("Mars", b.Mars);
  push("Jupiter", b.Jupiter);
  push("Saturn", b.Saturn);
  push("Uranus", b.Uranus);
  push("Neptune", b.Neptune);
  push("Pluto", b.Pluto);
  push("NorthNode", b.TrueNode_North || b.NorthNode);
  push("SouthNode", b.TrueNode_South || b.SouthNode);

  if (asc) planets.push({ body: "ASC", ...asc });
  if (mc) planets.push({ body: "MC", ...mc });

  return {
    input: {
      name: metaInput?.name || "未命名",
      city: metaInput?.city || "—",
      utcOffset: metaInput?.utcOffset || hoursToUtcOffsetStr(tzOffsetHours),
      birthDateTime: metaInput?.birthDateTime || "",
      lat: metaInput?.lat,
      lon: metaInput?.lon,
    },
    core: { asc, mc, sun: mk(b.Sun), moon: mk(b.Moon) },
    coreFull: { planets, houses: chart?.houses?.cusps || [] },
    raw: chart,
  };
}

/** ===== Routes ===== */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    // ✅ /tmp 可能会丢：读不到就给明确提示
    try {
      const chart = await loadChart(id);
      const keyConfig = chartToKeyConfig(chart);
      return NextResponse.json({ ok: true, id, keyConfig, storage: "tmp" });
    } catch (e: any) {
      return NextResponse.json(
        {
          ok: false,
          error: "Chart not found in /tmp cache (serverless tmp is ephemeral). Please recompute.",
          id,
        },
        { status: 404 }
      );
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const input = buildInput(body);

    const chart = await calcChartSync(input);

    // 固化“用户输入”
    chart.meta = chart.meta || {};
    (chart.meta as any).input = {
      name: input.name,
      city: input.locationName,
      birthDateTime: inputToLocalBirthDateTime(input),
      tzOffsetHours: input.tzOffsetHours,
      utcOffset: hoursToUtcOffsetStr(input.tzOffsetHours),
      lat: input.lat,
      lon: input.lon,
    };

    // Store location name inside the input instead of as top-level key (fix lint)
    // and keep location as before
    chart.meta.location = { lat: input.lat, lon: input.lon };

    const id = genId();

    // ✅ /tmp 写失败也不让接口崩（serverless 偶发）
    try {
      await saveChart(id, chart);
    } catch (e) {
      console.warn("saveChart(/tmp) failed, fallback to no-persist:", e);
    }

    const keyConfig = chartToKeyConfig(chart);
    return NextResponse.json({ ok: true, id, keyConfig, debugInput: input, storage: "tmp" });
  } catch (e: any) {
    console.error("CHART API ERROR:", e);
    console.error(e?.stack);
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}