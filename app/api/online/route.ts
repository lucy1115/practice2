// 即時線上人數：前端每隔一段時間送一次心跳，超過 TIMEOUT 沒送就視為離線
// 資料存在記憶體中，server 重啟就會清空
const TIMEOUT = 30_000;

const store = globalThis as typeof globalThis & { onlineUsers?: Map<string, number> };
const users = (store.onlineUsers ??= new Map());

// body: { id: string, leave?: boolean }
export async function POST(request: Request) {
  const { id, leave } = await request.json();
  if (typeof id !== "string" || !id) {
    return Response.json({ error: "缺少 id" }, { status: 400 });
  }

  const now = Date.now();
  if (leave) {
    users.delete(id);
  } else {
    users.set(id, now);
  }

  for (const [userId, lastSeen] of users) {
    if (now - lastSeen > TIMEOUT) users.delete(userId);
  }

  return Response.json({ online: users.size });
}
