// lib/chartStore.ts
import fs from "fs/promises";
import path from "path";

export type ChartRow = {
  id: string;
  createdAt: string;
  keyConfig: any;
};
// 使用绝对路径锁定，防止 process.cwd() 漂移
const DB_PATH = path.resolve(process.cwd(), ".data"); 
const FILE_PATH = path.join(DB_PATH, "charts.json");

async function ensureFile() {
  await fs.mkdir(DB_PATH, { recursive: true });
  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.writeFile(FILE_PATH, JSON.stringify({}), "utf-8");
  }
}

async function readAll(): Promise<Record<string, ChartRow>> {
  await ensureFile();
  const raw = await fs.readFile(FILE_PATH, "utf-8");
  return JSON.parse(raw || "{}");
}

async function writeAll(all: Record<string, ChartRow>) {
  await ensureFile();
  await fs.writeFile(FILE_PATH, JSON.stringify(all, null, 2), "utf-8");
}

export async function saveChart(row: ChartRow) {
  const all = await readAll();
  all[row.id] = row;
  await writeAll(all);
  return row;
}

export async function readChart(id: string): Promise<ChartRow | null> {
  const all = await readAll();
  return all[id] ?? null;
}

/**
 * ✅ 兼容别名：我之前给你的 api/chart GET 用的是 getChart
 * 你也可以不改 api/chart，直接用 readChart；但加这个最省事
 */
export async function getChart(id: string): Promise<ChartRow | null> {
  return readChart(id);
}

// 你后面如果要存 A/B/C 深度报告，可以加这个（先不影响现有逻辑）
export async function saveDeepReport(_: any) {
  return;
}
