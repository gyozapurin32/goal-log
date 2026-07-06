"use client";
import Link from "next/link";
import { useState } from "react";

import { STATUS, STATUS_LIST } from "@/lib/status";

export default function GoalPage() {
const [status, setStatus] = useState(STATUS.NOT_STARTED);
  return (
    <main className="p-6">

      <h1 className="text-2xl font-bold">
        ステータス画面
      </h1>
      <div className="mt-6">
  <h2 className="font-semibold mb-3">現在のステータス</h2>

  {STATUS_LIST.map((item) => (
    <button
      key={item.value}
      type="button"
      onClick={() => setStatus(item.value)}
      className={`w-full rounded-lg border p-4 mb-3 text-left transition ${
        status === item.value
          ? "bg-blue-500 text-white border-blue-500"
          : "bg-white hover:bg-gray-100"
      }`}
    >
      {status === item.value ? "✓ " : ""}
      {item.icon} {item.value}
    </button>
  ))}
</div>

      <Link href="/home">
        <button className="mt-8 bg-gray-300 px-4 py-2 rounded">
          更新する
        </button>
      </Link>
      <Link href="/home">
        <button className="mt-8 bg-gray-300 px-4 py-2 rounded">
          ←ホームへ戻る
        </button>
      </Link>

    </main>
  );
}