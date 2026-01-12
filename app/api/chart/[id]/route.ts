// app/api/chart/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getChart } from "@/lib/chartStore";

// 如果你需要 node runtime（比如用到 fs），保留这一行
export const runtime = "nodejs";

// 这里的 ChartRow 类型如果你 chartStore 里有导出就引用；没有也没关系
// type ChartRow = any;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ 按 Vercel/Next 期望：params 是 Promise
) {
  const { id } = await context.params; // ✅ 必须 await

  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const record = await getChart(id);

  if (!record) {
    return NextResponse.json({ error: "Chart not found" }, { status: 404 });
  }

  return NextResponse.json(record);
}