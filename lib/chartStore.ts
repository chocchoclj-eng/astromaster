// lib/chartStore.ts
import fs from "fs/promises";
import path from "path";

export type ChartRow = {
  id: string;
  createdAt: string;
  keyConfig: any;
};

// 是否运行在 Vercel
const isVercel = !!process.env.VERCEL;

// ✅ Vercel: 只能写 /tmp（临时）
// ✅ 本地: 仍然使用项目目录下的 .data
const BASE_DIR = isVercel
  ? "/tmp"
  : path.resolve(process.cwd(), ".data");

const DB_PATH = path.join(BASE_DIR, "charts");
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

// ✅ 兼容你已有的 api/chart GET
export async function getChart(id: string): Promise<ChartRow | null> {
  return readChart(id);
}

// 预留接口
export async function saveDeepReport(_: any) {
  return;
}