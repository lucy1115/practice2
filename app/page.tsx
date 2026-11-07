"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const HEARTBEAT_INTERVAL = 10_000;

export default function Home() {
  const [online, setOnline] = useState<number | null>(null);

  // 一進頁面就呼叫 app/api/online/route.ts，之後定時送心跳，離開時通知後端
  useEffect(() => {
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);

    async function heartbeat() {
      const res = await fetch("/api/online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      setOnline(data.online);
    }

    function leave() {
      navigator.sendBeacon("/api/online", JSON.stringify({ id, leave: true }));
    }

    heartbeat();
    const timer = setInterval(heartbeat, HEARTBEAT_INTERVAL);
    window.addEventListener("pagehide", leave);
    return () => {
      clearInterval(timer);
      window.removeEventListener("pagehide", leave);
      leave();
    };
  }, []);

  const [helloMessage, setHelloMessage] = useState("");
  const [helloCount, setHelloCount] = useState<number | null>(null);

  // 呼叫 app/api/hello/route.ts，每次呼叫後端計數 +1
  async function callHello() {
    const res = await fetch("/api/hello");
    const data = await res.json();
    setHelloMessage(data.message);
    setHelloCount(data.count);
  }

  const [lottery, setLottery] = useState<{ win: boolean; message: string } | null>(null);
  const [drawing, setDrawing] = useState(false);

  // 呼叫 app/api/lottery/route.ts，由後端決定是否中獎（30%）
  async function draw() {
    setDrawing(true);
    try {
      const res = await fetch("/api/lottery", { method: "POST" });
      setLottery(await res.json());
    } finally {
      setDrawing(false);
    }
  }

  const [primeInput, setPrimeInput] = useState("");
  const [primeResult, setPrimeResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [checking, setChecking] = useState(false);

  // 呼叫 app/api/prime/route.ts 判斷是否為質數
  async function checkPrime() {
    if (!primeInput.trim()) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/prime?n=${encodeURIComponent(primeInput)}`);
      const data = await res.json();
      setPrimeResult(res.ok ? { ok: data.isPrime, message: data.message } : { ok: false, message: data.error });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-6 px-6 py-24">
        <p className="flex items-center gap-2 self-end text-sm text-zinc-600 dark:text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          目前線上人數：{online ?? "-"}
        </p>

        <section className="flex items-center justify-between gap-4 rounded-lg bg-white px-4 py-4 shadow-sm dark:bg-zinc-900">
          <div>
            <p className="text-lg font-medium text-black dark:text-zinc-50">
              {helloMessage || "按下按鈕呼叫 hello API"}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              累計次數：{helloCount ?? "-"}
            </p>
          </div>
          <button
            className="rounded-lg bg-black px-5 py-2 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-300"
            onClick={callHello}
          >
            +1
          </button>
        </section>

        <section className="flex items-center justify-between gap-4 rounded-lg bg-white px-4 py-4 shadow-sm dark:bg-zinc-900">
          <div>
            <p className="text-lg font-medium text-black dark:text-zinc-50">
              抽獎（中獎機率 30%）
            </p>
            <p
              className={
                lottery?.win
                  ? "font-medium text-green-600 dark:text-green-400"
                  : "text-zinc-600 dark:text-zinc-400"
              }
            >
              {lottery?.message ?? "按下按鈕試試手氣"}
            </p>
          </div>
          <button
            className="rounded-lg bg-black px-5 py-2 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-300"
            onClick={draw}
            disabled={drawing}
          >
            {drawing ? "抽獎中..." : "抽獎"}
          </button>
        </section>

        <section className="flex flex-col gap-3 rounded-lg bg-white px-4 py-4 shadow-sm dark:bg-zinc-900">
          <p className="text-lg font-medium text-black dark:text-zinc-50">質數判斷</p>
          <div className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              inputMode="numeric"
              placeholder="輸入一串數字，例如 97"
              value={primeInput}
              onChange={(e) => setPrimeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) checkPrime();
              }}
            />
            <button
              className="rounded-lg bg-black px-5 py-2 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-300"
              onClick={checkPrime}
              disabled={checking}
            >
              {checking ? "判斷中..." : "判斷"}
            </button>
          </div>
          {primeResult && (
            <p
              className={`break-all ${
                primeResult.ok
                  ? "font-medium text-green-600 dark:text-green-400"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {primeResult.message}
            </p>
          )}
        </section>

        <section className="flex items-center justify-between gap-4 rounded-lg bg-white px-4 py-4 shadow-sm dark:bg-zinc-900">
          <div>
            <p className="text-lg font-medium text-black dark:text-zinc-50">MBTI 分析</p>
            <p className="text-zinc-600 dark:text-zinc-400">描述你的個性，讓 AI 猜猜你的 MBTI</p>
          </div>
          <Link
            href="/mbti"
            className="shrink-0 rounded-lg bg-black px-5 py-2 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-300"
          >
            前往
          </Link>
        </section>

        <section className="flex items-center justify-between gap-4 rounded-lg bg-white px-4 py-4 shadow-sm dark:bg-zinc-900">
          <div>
            <p className="text-lg font-medium text-black dark:text-zinc-50">禮物推薦</p>
            <p className="text-zinc-600 dark:text-zinc-400">選擇收禮者的條件，讓 AI 推薦送什麼</p>
          </div>
          <Link
            href="/gift"
            className="shrink-0 rounded-lg bg-black px-5 py-2 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-300"
          >
            前往
          </Link>
        </section>
      </main>
    </div>
  );
}
