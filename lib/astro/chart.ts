import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

type Sweph = any;
let _sweph: Sweph | null = null;

function getSweph(): Sweph {
  if (_sweph) return _sweph;

  // MARKER: if you still see old stack with `_sweph = require("sweph")`,
  // Next is NOT loading this file content.
  console.log("[MARKER] chart.ts updated + loaded");

  try {
    _sweph = require("sweph");
    return _sweph;
  } catch (e: any) {
    // Fallback: load native .node via absolute path first
    const swephEntry = require.resolve("sweph");
    const pkgRoot = path.dirname(swephEntry);
    const nativePath = path.join(pkgRoot, "build", "Release", "sweph.node");
    require(nativePath);

    _sweph = require("sweph");
    return _sweph;
  }
}

const SE_GREG = 1;

let inited = false;
function init() {
  const sweph = getSweph();
  if (inited) return;
  sweph.set_ephe_path(path.join(process.cwd(), "ephe"));
  inited = true;
}

const norm = (x: number) => ((x % 360) + 360) % 360;

function localToUTC(
  y: number, m: number, d: number,
  hh: number, mm: number, ss: number,
  tzOffsetHours: number
) {
  const dt = new Date(Date.UTC(y, m - 1, d, hh - tzOffsetHours, mm, ss));
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
  init();
  const sweph = getSweph();
  const r = sweph.utc_to_jd(utc.y, utc.m, utc.d, utc.hh, utc.mm, utc.ss, SE_GREG);
  if (r.flag !== 0) throw new Error(r.error || "utc_to_jd failed");
  return { jd_et: r.data[0] as number, jd_ut: r.data[1] as number };
}

function getHousesKoch(jd_ut: number, lat: number, lon: number) {
  init();
  const sweph = getSweph();
  const h = sweph.houses(jd_ut, lat, lon, "K");
  if (h.flag !== 0) throw new Error("houses failed");
  const cusps: number[] = (h.data.houses as number[]).map(norm);
  const points: number[] = (h.data.points as number[]).map(norm);
  return { cusps, points };
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
  init();
  const sweph = getSweph();
  const FLAG = (sweph.FLG_SWIEPH ?? 0) | (sweph.FLG_SPEED ?? 0);
  const r = sweph.calc_ut(jd_ut, id, FLAG);
  if (r.flag !== 0) throw new Error(r.error || "calc_ut failed");
  const lon = norm(r.data?.[0] ?? r.lon ?? r.xx?.[0]);
  const lat = r.data?.[1];
  const speed = r.data?.[3];
  return { lon, lat, speed };
}

const aspectDefs = [
  { type: "conj", ang: 0, orb: 8 },
  { type: "opp", ang: 180, orb: 8 },
  { type: "trine", ang: 120, orb: 6 },
  { type: "square", ang: 90, orb: 6 },
  { type: "sextile", ang: 60, orb: 4 },
] as const;

export function calcChartKoch(params: {
  y: number; m: number; d: number; hh: number; mm: number; ss: number;
  tzOffsetHours: number;
  lat: number; lon: number;
  locationName?: string;
}) {
  // ensure sweph loaded at request time
  getSweph();

  const utc = localToUTC(params.y, params.m, params.d, params.hh, params.mm, params.ss, params.tzOffsetHours);
  const { jd_ut } = utcToJdUt(utc);

  const { cusps, points } = getHousesKoch(jd_ut, params.lat, params.lon);
  const ASC = points[0];
  const MC = points[1];

  const sweph = getSweph();
  const BODIES: Record<string, number> = {
    Sun: sweph.SE_SUN,
    Moon: sweph.SE_MOON,
    Mercury: sweph.SE_MERCURY,
    Venus: sweph.SE_VENUS,
    Mars: sweph.SE_MARS,
    Jupiter: sweph.SE_JUPITER,
    Saturn: sweph.SE_SATURN,
    Uranus: sweph.SE_URANUS,
    Neptune: sweph.SE_NEPTUNE,
    Pluto: sweph.SE_PLUTO,
    TrueNode: sweph.SE_TRUE_NODE,
  };

  const bodies: Record<string, any> = {};
  for (const [name, id] of Object.entries(BODIES)) {
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

  const keys = Object.keys(bodies).filter((k) => !k.startsWith("TrueNode_"));
  const aspects: any[] = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = keys[i], b = keys[j];
      const la = bodies[a]?.lon, lb = bodies[b]?.lon;
      if (typeof la !== "number" || typeof lb !== "number") continue;
      let diff = Math.abs(norm(la - lb));
      diff = diff > 180 ? 360 - diff : diff;
      for (const ad of aspectDefs) {
        const orb = Math.abs(diff - ad.ang);
        if (orb <= ad.orb) {
          aspects.push({ a, b, type: ad.type, orb, exact: diff });
          break;
        }
      }
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
      location: { name: params.locationName, lat: params.lat, lon: params.lon },
    },
    angles: { ASC, MC },
    houses: { cusps },
    bodies,
    aspects,
  };
}
