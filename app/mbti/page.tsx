"use client";

import Link from "next/link";
import { useState } from "react";

type MbtiResult = {
  type: string;
  nickname: string;
  summary: string;
  dimensions: { letter: string; reason: string }[];
};

export default function MbtiPage() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<MbtiResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 呼叫 app/api/mbti/route.ts，由後端去問 OpenAI
  async function analyze() {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/mbti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.error);
    } catch {
      setError("連線失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-6 px-6 py-24">
        <Link href="/" className="self-start text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          ← 回首頁
        </Link>

        <section className="flex flex-col gap-3 rounded-lg bg-white px-4 py-4 shadow-sm dark:bg-zinc-900">
          <p className="text-lg font-medium text-black dark:text-zinc-50">MBTI 分析</p>
          <textarea
            className="min-h-32 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            placeholder="描述一下你的個性，例如：我喜歡一個人待著充電，做事前會先想好計畫..."
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            className="self-end rounded-lg bg-black px-5 py-2 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-300"
            onClick={analyze}
            disabled={loading || !description.trim()}
          >
            {loading ? "分析中..." : "分析我的 MBTI"}
          </button>
        </section>

        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

        {result && (
          <section className="flex flex-col gap-4 rounded-lg bg-white px-4 py-4 shadow-sm dark:bg-zinc-900">
            <div>
              <p className="text-4xl font-bold tracking-widest text-black dark:text-zinc-50">
                {result.type}
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">{result.nickname}</p>
            </div>
            <p className="text-black dark:text-zinc-50">{result.summary}</p>
            <ul className="flex flex-col gap-2">
              {result.dimensions.map((d, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 shrink-0 font-bold text-black dark:text-zinc-50">{d.letter}</span>
                  <span className="text-zinc-600 dark:text-zinc-400">{d.reason}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
