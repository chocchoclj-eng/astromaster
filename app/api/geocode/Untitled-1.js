// app/api/geocode/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// ⚠️ 你提供的高德 API Key（已直接写入）
const AMAP_KEY =
  "5424bf1ddbc9188276a1437c85e0b432c87d252e584da8d95f867c6ec0bcdd16";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({ error: "Missing q" }, { status: 400 });
    }

    const url =
      "https://restapi.amap.com/v3/geocode/geo?" +
      new URLSearchParams({
        key: AMAP_KEY,
        address: q,
      }).toString();

    const r = await fetch(url);
    if (!r.ok) {
      return NextResponse.json(
        { error: `AMap request failed: ${r.status}` },
        { status: 502 }
      );
    }

    const data = await r.json();

    if (data.status !== "1" || !data.geocodes || data.geocodes.length === 0) {
      return NextResponse.json(
        { error: "No geocode result", raw: data },
        { status: 404 }
      );
    }

    const g = data.geocodes[0];
    const [lon, lat] = g.location.split(",").map(Number);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json(
        { error: "Invalid lat/lon", raw: g },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      place: {
        lat,
        lon,
        display_name: g.formatted_address || q,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "geocode error" },
      { status: 500 }
    );
  }
}
