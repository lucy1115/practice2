// 計數存在記憶體中，server 重啟就會歸零
// 放在 globalThis 上，避免開發模式修改程式碼時被重置
const store = globalThis as typeof globalThis & { helloCount?: number };

export async function GET() {
  store.helloCount = (store.helloCount ?? 0) + 1;
  return Response.json({ message: "歡迎來到這門課", count: store.helloCount });
}
