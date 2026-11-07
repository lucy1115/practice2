// 共用的 OpenAI 呼叫：送出 system / user 訊息，並用 JSON Schema 規定回傳格式
// API key 只在後端讀取（.env.local 的 OPENAI_API_KEY），不會傳到瀏覽器
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export class OpenAIError extends Error {}

export async function askOpenAIForJson<T>(options: {
  system: string;
  user: string;
  schemaName: string;
  schema: object;
}): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new OpenAIError("後端沒有設定 OPENAI_API_KEY");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: options.system },
        { role: "user", content: options.user },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: options.schemaName, strict: true, schema: options.schema },
      },
    }),
  });

  if (!res.ok) {
    console.error("OpenAI API 錯誤：", res.status, await res.text());
    throw new OpenAIError("AI 分析失敗，請稍後再試");
  }

  const data = await res.json();
  try {
    return JSON.parse(data.choices?.[0]?.message?.content);
  } catch {
    throw new OpenAIError("AI 回傳格式錯誤，請再試一次");
  }
}
