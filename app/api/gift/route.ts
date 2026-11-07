// 根據下拉選單的條件，請 OpenAI 推薦送禮類型，並要求它用固定的 JSON 格式回覆
import { GIFT_FIELDS } from "@/lib/gift-options";
import { askOpenAIForJson, OpenAIError } from "@/lib/openai";

// 規定 OpenAI 回傳的 JSON 結構（Structured Outputs）
const GIFT_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string", description: "一兩句話總結這位收禮者適合的送禮方向" },
    gifts: {
      type: "array",
      description: "3~5 個推薦的禮物類型",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "禮物類型，例如「手沖咖啡器具組」" },
          priceRange: { type: "string", description: "大約價格範圍，例如「800–1,500 元」" },
          reason: { type: "string", description: "一兩句話說明為什麼適合" },
        },
        required: ["name", "priceRange", "reason"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "gifts"],
  additionalProperties: false,
};

// body: { relation, age, gender, region, interest, budget, occasion }，值必須是 lib/gift-options.ts 裡的選項
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const lines: string[] = [];
  for (const field of GIFT_FIELDS) {
    const value = body?.[field.key];
    if (!(field.options as readonly string[]).includes(value)) {
      return Response.json({ error: `請選擇「${field.label}」` }, { status: 400 });
    }
    lines.push(`${field.label}：${value}`);
  }

  try {
    const result = await askOpenAIForJson({
      system:
        "你是貼心的送禮顧問。根據收禮者的條件，推薦 3~5 個適合的禮物類型，價格要符合預算，並考慮地區的取得方便性。請用繁體中文回答。",
      user: lines.join("\n"),
      schemaName: "gift_recommendation",
      schema: GIFT_SCHEMA,
    });
    return Response.json(result);
  } catch (err) {
    const message = err instanceof OpenAIError ? err.message : "AI 推薦失敗，請稍後再試";
    return Response.json({ error: message }, { status: 502 });
  }
}
