import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";

export const runtime = "nodejs";

const STORE_DIR = path.join(process.cwd(), ".data", "charts");

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
function mustStr(v: any, name: string) {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`Missing ${name}`);
  return s;
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

  const locationName = mustStr(params.locationName ?? params.city, "locationName");
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

async function runWorker(input: any) {
  const workerPath = path.join(process.cwd(), "scripts", "chart-worker.cjs");
  return await new Promise<any>((resolve, reject) => {
    const p = spawn(process.execPath, [workerPath], { stdio: ["pipe", "pipe", "pipe"], env: process.env });

    const out: Buffer[] = [];
    const err: Buffer[] = [];
    p.stdout.on("data", (d) => out.push(d));
    p.stderr.on("data", (d) => err.push(d));
    p.on("error", reject);

    p.on("close", (code) => {
      const stderr = Buffer.concat(err).toString("utf8").trim();
      const stdout = Buffer.concat(out).toString("utf8").trim();
      if (!stdout) return reject(new Error(stderr || `worker exited code=${code}`));
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error(`worker output not json:\n${stdout}\n\nstderr:\n${stderr}`));
      }
    });

    p.stdin.write(JSON.stringify(input));
    p.stdin.end();
  });
}

/** ===== chart -> keyConfig 适配（用于你现有 ReportClient/Live） ===== */

const SIGNS_ZH = ["白羊","金牛","双子","巨蟹","狮子","处女","天秤","天蝎","射手","摩羯","水瓶","双鱼"];
function norm360(x: number) { return ((x % 360) + 360) % 360; }
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
  const mcLon  = Number(chart?.angles?.MC);

  const asc = Number.isFinite(ascLon) ? { ...lonToSign(ascLon), house: 1 } : null;
  const mc  = Number.isFinite(mcLon)  ? { ...lonToSign(mcLon),  house: 10 } : null;

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
  if (mc)  planets.push({ body: "MC",  ...mc });

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

    const chart = await loadChart(id);
    const keyConfig = chartToKeyConfig(chart);

    return NextResponse.json({ ok: true, id, keyConfig });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const input = buildInput(body);

    // ✅ 让 worker 用输入的 lat/lon 计算（worker 必须读 input.lat/lon）
    const chart = await runWorker(input);

    // ✅ 固化“用户输入”（report 显示就稳定，不会再 00:09 -> 08:09）
    chart.meta = chart.meta || {};
    chart.meta.input = {
      name: input.name,
      city: input.locationName,
      birthDateTime: inputToLocalBirthDateTime(input),
      tzOffsetHours: input.tzOffsetHours,
      utcOffset: hoursToUtcOffsetStr(input.tzOffsetHours),
      lat: input.lat,
      lon: input.lon,
    };
    chart.meta.locationName = input.locationName;
    chart.meta.location = { lat: input.lat, lon: input.lon };

    const id = genId();
    await saveChart(id, chart);

    const keyConfig = chartToKeyConfig(chart);

    // 你用来排查输入是否正确（生产可删）
    return NextResponse.json({ ok: true, id, keyConfig, debugInput: input });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}

