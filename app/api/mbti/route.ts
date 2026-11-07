// 把使用者的個性描述送給 OpenAI 分析 MBTI，並要求它用固定的 JSON 格式回覆
// API key 只在後端讀取（.env.local 的 OPENAI_API_KEY），不會傳到瀏覽器
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const MAX_LENGTH = 1000;

// 規定 OpenAI 回傳的 JSON 結構（Structured Outputs）
const MBTI_SCHEMA = {
  type: "object",
  properties: {
    type: { type: "string", description: "四個字母的 MBTI 類型，例如 INFP" },
    nickname: { type: "string", description: "這個類型的暱稱，例如「調停者」" },
    summary: { type: "string", description: "2~3 句話說明為什麼是這個類型" },
    dimensions: {
      type: "array",
      description: "四個維度的判斷，依序為 E/I、S/N、T/F、J/P",
      items: {
        type: "object",
        properties: {
          letter: { type: "string", description: "這個維度選出的字母" },
          reason: { type: "string", description: "一句話說明判斷依據" },
        },
        required: ["letter", "reason"],
        additionalProperties: false,
      },
    },
  },
  required: ["type", "nickname", "summary", "dimensions"],
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "後端沒有設定 OPENAI_API_KEY" }, { status: 500 });
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "你是 MBTI 性格分析師。根據使用者對自己個性的描述，判斷最可能的 MBTI 類型。請用繁體中文回答。",
        },
        { role: "user", content: description },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "mbti_result", strict: true, schema: MBTI_SCHEMA },
      },
    }),
  });

  if (!res.ok) {
    console.error("OpenAI API 錯誤：", res.status, await res.text());
    return Response.json({ error: "AI 分析失敗，請稍後再試" }, { status: 502 });
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  try {
    return Response.json(JSON.parse(content));
  } catch {
    return Response.json({ error: "AI 回傳格式錯誤，請再試一次" }, { status: 502 });
  }
}
