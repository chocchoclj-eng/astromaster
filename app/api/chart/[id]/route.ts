// app/api/chart/[id]/route.ts
import { NextResponse } from "next/server";
import { getChart } from "@/lib/chartStore";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;
  const record = await getChart(id);

  if (!record) {
    return NextResponse.json({ error: "Chart not found" }, { status: 404 });
  }

  return NextResponse.json(record);
}
