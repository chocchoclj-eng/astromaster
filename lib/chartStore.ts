// lib/chartStore.ts
// 使用 Upstash Redis REST API 存储数据（无需额外 SDK，直接 fetch）

export type ChartRow = {
  id: string;
  createdAt: string;
  keyConfig: any;
};

const getKey = (id: string) => `chart:${id}`;

async function redisCommand(command: string, ...args: string[]) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing KV_REST_API_URL or KV_REST_API_TOKEN in environment variables."
    );
  }

  const res = await fetch(`${url}/${command}/${args.map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstash Redis error: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.result;
}

export async function saveChart(row: ChartRow): Promise<ChartRow> {
  if (!row.id) throw new Error("ChartRow must have an id");
  await redisCommand("set", getKey(row.id), JSON.stringify(row));
  return row;
}

export async function readChart(id: string): Promise<ChartRow | null> {
  if (!id) return null;
  const raw = await redisCommand("get", getKey(id));
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

// 兼容已有的 api/chart GET
export async function getChart(id: string): Promise<ChartRow | null> {
  return readChart(id);
}

// 预留接口
export async function saveDeepReport(_: any): Promise<void> {
  return;
}
