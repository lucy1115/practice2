// 把使用者的個性描述送給 OpenAI 分析 MBTI，並要求它用固定的 JSON 格式回覆
import { askOpenAIForJson, OpenAIError } from "@/lib/openai";

const MAX_LENGTH = 1000;

// 四個維度各自一個欄位，字母用 enum 限定，MBTI 類型由後端組合，避免 AI 回傳不一致
const DIMENSIONS = [
  ["ei", "E", "I"],
  ["sn", "S", "N"],
  ["tf", "T", "F"],
  ["jp", "J", "P"],
] as const;

type DimensionKey = (typeof DIMENSIONS)[number][0];
type AIResult = Record<DimensionKey, { letter: string; reason: string }> & {
  nickname: string;
  summary: string;
};

function dimensionSchema(a: string, b: string) {
  return {
    type: "object",
    properties: {
      letter: { type: "string", enum: [a, b], description: `${a} 或 ${b}` },
      reason: { type: "string", description: "一句話說明判斷依據" },
    },
    required: ["letter", "reason"],
    additionalProperties: false,
  };
}

// 規定 OpenAI 回傳的 JSON 結構（Structured Outputs）
const MBTI_SCHEMA = {
  type: "object",
  properties: {
    ...Object.fromEntries(DIMENSIONS.map(([key, a, b]) => [key, dimensionSchema(a, b)])),
    nickname: { type: "string", description: "這個 MBTI 類型的暱稱，例如「調停者」" },
    summary: { type: "string", description: "2~3 句話說明為什麼是這個類型" },
  },
  required: [...DIMENSIONS.map(([key]) => key), "nickname", "summary"],
  additionalProperties: false,
};

// body: { description: string }
export async function POST(request: Request) {
  const { description } = await request.json().catch(() => ({}));
  if (typeof description !== "string" || !description.trim()) {
    return Response.json({ error: "請先描述一下你的個性" }, { status: 400 });
  }
  if (description.length > MAX_LENGTH) {
    return Response.json({ error: `描述最多 ${MAX_LENGTH} 字` }, { status: 400 });
  }

  try {
    const result = await askOpenAIForJson<AIResult>({
      system:
        "你是 MBTI 性格分析師。根據使用者對自己個性的描述，逐一判斷四個維度，得出最可能的 MBTI 類型。請用繁體中文回答。",
      user: description,
      schemaName: "mbti_result",
      schema: MBTI_SCHEMA,
    });
    const dimensions = DIMENSIONS.map(([key]) => result[key]);
    return Response.json({
      type: dimensions.map((d) => d.letter).join(""),
      nickname: result.nickname,
      summary: result.summary,
      dimensions,
    });
  } catch (err) {
    const message = err instanceof OpenAIError ? err.message : "AI 分析失敗，請稍後再試";
    return Response.json({ error: message }, { status: 502 });
  }
}
