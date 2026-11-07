"use client";

import Link from "next/link";
import { useState } from "react";
import { GIFT_FIELDS, type GiftAnswers } from "@/lib/gift-options";

type GiftResult = {
  summary: string;
  gifts: { name: string; priceRange: string; reason: string }[];
};

const EMPTY_ANSWERS = Object.fromEntries(GIFT_FIELDS.map((f) => [f.key, ""])) as GiftAnswers;

export default function GiftPage() {
  const [answers, setAnswers] = useState<GiftAnswers>(EMPTY_ANSWERS);
  const [result, setResult] = useState<GiftResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const allSelected = GIFT_FIELDS.every((f) => answers[f.key]);

  // 呼叫 app/api/gift/route.ts，由後端去問 OpenAI
  async function recommend() {
    if (!allSelected) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
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

        <section className="flex flex-col gap-4 rounded-lg bg-white px-4 py-4 shadow-sm dark:bg-zinc-900">
          <p className="text-lg font-medium text-black dark:text-zinc-50">禮物推薦</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {GIFT_FIELDS.map((field) => (
              <label key={field.key} className="flex flex-col gap-1">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{field.label}</span>
                <select
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  value={answers[field.key]}
                  onChange={(e) => setAnswers({ ...answers, [field.key]: e.target.value })}
                >
                  <option value="" disabled>
                    請選擇
                  </option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <button
            className="self-end rounded-lg bg-black px-5 py-2 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-300"
            onClick={recommend}
            disabled={loading || !allSelected}
          >
            {loading ? "推薦中..." : "推薦禮物"}
          </button>
        </section>

        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

        {result && (
          <section className="flex flex-col gap-4 rounded-lg bg-white px-4 py-4 shadow-sm dark:bg-zinc-900">
            <p className="text-black dark:text-zinc-50">{result.summary}</p>
            <ul className="flex flex-col gap-3">
              {result.gifts.map((gift, i) => (
                <li key={i} className="flex flex-col gap-1 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium text-black dark:text-zinc-50">{gift.name}</span>
                    <span className="shrink-0 text-sm text-zinc-600 dark:text-zinc-400">{gift.priceRange}</span>
                  </div>
                  <span className="text-zinc-600 dark:text-zinc-400">{gift.reason}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
