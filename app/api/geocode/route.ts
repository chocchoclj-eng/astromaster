// app/api/geocode/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithTimeout(url: string, timeoutMs = 3500) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

export async function GET(req: Request) {
  try {
    if (!GOOGLE_KEY) {
      return NextResponse.json(
        { ok: false, error: "Missing GOOGLE_MAPS_API_KEY in env (.env.local)" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    if (!q) return NextResponse.json({ ok: false, error: "Missing q" }, { status: 400 });

    // 你要“任何城市都能搜到”：建议用户输入“城市 国家”，但这里也做容错
    const address = q;

    const url =
      "https://maps.googleapis.com/maps/api/geocode/json" +
      `?address=${encodeURIComponent(address)}` +
      `&key=${encodeURIComponent(GOOGLE_KEY)}`;

    // ✅ 失败重试：最多 3 次（1 次正常 + 2 次重试）
    let last: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetchWithTimeout(url, 3500);
        const text = await res.text();

        // Google 正常返回 json；但极端情况可能返回 HTML/空
        let raw: any = null;
        try {
          raw = JSON.parse(text);
        } catch {
          last = { stage: "json_parse", textPreview: text.slice(0, 120) };
          throw new Error("Geocode returned non-JSON (network/proxy/html)");
        }

        last = raw;

        const status = raw?.status;
        if (status === "OK" && raw?.results?.length) {
          const r0 = raw.results[0];
          const lat = r0?.geometry?.location?.lat;
          const lon = r0?.geometry?.location?.lng;
          const display_name = r0?.formatted_address;

          if (Number.isFinite(lat) && Number.isFinite(lon)) {
            return NextResponse.json({
              ok: true,
              place: { lat, lon, display_name },
            });
          }

          return NextResponse.json(
            { ok: false, error: "No lat/lon in geocode result", raw },
            { status: 502 }
          );
        }

        // 可重试的情况：OVER_QUERY_LIMIT / UNKNOWN_ERROR / timeout 等
        if (status === "OVER_QUERY_LIMIT" || status === "UNKNOWN_ERROR") {
          await sleep(250 * attempt);
          continue;
        }

        // 不可重试：REQUEST_DENIED / ZERO_RESULTS 等
        if (status === "ZERO_RESULTS") {
          return NextResponse.json(
            {
              ok: false,
              error: "No geocode result",
              hint: "试试加上国家/省市，例如“上海 中国”“Los Angeles USA”",
              raw,
            },
            { status: 404 }
          );
        }

        return NextResponse.json(
          {
            ok: false,
            error: "Geocode failed",
            googleStatus: status,
            raw,
          },
          { status: 502 }
        );
      } catch (e: any) {
        // 超时/abort -> 重试
        const msg = String(e?.message || e);
        if (msg.includes("aborted") || msg.includes("AbortError")) {
          await sleep(200 * attempt);
          continue;
        }
        // 其它异常也可重试一次
        if (attempt < 3) {
          await sleep(200 * attempt);
          continue;
        }
        return NextResponse.json(
          { ok: false, error: msg || "Geocode error", debug: last },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { ok: false, error: "Geocode failed after retries", debug: last },
      { status: 500 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "geocode api error" },
      { status: 500 }
    );
  }
}
