// lib/aspectEngine.ts

export type AspectType = "CONJ" | "SEXT" | "SQR" | "TRI" | "OPP";

export type Aspect = {
  a: string;
  b: string;
  type: AspectType;
  exact: number; // exact angle: 0/60/90/120/180
  orb: number;   // abs diff to exact
  delta: number; // shortest angle 0..180
};

const ASPECTS: Array<{ type: AspectType; exact: number; orb: number }> = [
  { type: "CONJ", exact: 0,   orb: 8 },
  { type: "SEXT", exact: 60,  orb: 5 },
  { type: "SQR",  exact: 90,  orb: 6 },
  { type: "TRI",  exact: 120, orb: 6 },
  { type: "OPP",  exact: 180, orb: 8 },
];

function norm360(x: number) {
  let v = x % 360;
  if (v < 0) v += 360;
  return v;
}

function shortestAngle(a: number, b: number) {
  const d = Math.abs(norm360(a) - norm360(b));
  return d > 180 ? 360 - d : d; // 0..180
}

export function computeAspects(
  bodies: Array<{ body: string; lon: number }>,
  opts?: { allowSelf?: boolean }
): Aspect[] {
  const out: Aspect[] = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const A = bodies[i];
      const B = bodies[j];
      if (!opts?.allowSelf && A.body === B.body) continue;

      const delta = shortestAngle(A.lon, B.lon);
      for (const rule of ASPECTS) {
        const orb = Math.abs(delta - rule.exact);
        if (orb <= rule.orb) {
          out.push({
            a: A.body,
            b: B.body,
            type: rule.type,
            exact: rule.exact,
            orb: Number(orb.toFixed(2)),
            delta: Number(delta.toFixed(2)),
          });
          break;
        }
      }
    }
  }

  // 更“稳定”的排序：先 orb 小，再按重要相位，再字母
  const order: Record<AspectType, number> = { CONJ: 1, OPP: 2, SQR: 3, TRI: 4, SEXT: 5 };
  out.sort((x, y) => {
    if (x.orb !== y.orb) return x.orb - y.orb;
    if (order[x.type] !== order[y.type]) return order[x.type] - order[y.type];
    const ax = `${x.a}-${x.b}`;
    const ay = `${y.a}-${y.b}`;
    return ax.localeCompare(ay);
  });

  return out;
}
