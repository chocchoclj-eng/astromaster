
// lib/chartStore.ts
import { kv } from '@vercel/kv';

export type ChartRow = {
  id: string;
  createdAt: string;
  keyConfig: any;
};

// 使用 Vercel KV 存储每个图表，key 的格式为 'chart:ID'
const getKey = (id: string) => `chart:${id}`;

export async function saveChart(row: ChartRow): Promise<ChartRow> {
  if (!row.id) throw new Error("ChartRow must have an id");
  await kv.set(getKey(row.id), row);
  return row;
}

export async function readChart(id: string): Promise<ChartRow | null> {
  if (!id) return null;
  const row = await kv.get<ChartRow>(getKey(id));
  return row ?? null;
}

// 兼容你已有的 api/chart GET
export async function getChart(id: string): Promise<ChartRow | null> {
  return readChart(id);
}

// 预留接口，目前不做任何事
export async function saveDeepReport(_: any): Promise<void> {
  console.log("saveDeepReport called, but is a no-op for now.");
  return;
}
