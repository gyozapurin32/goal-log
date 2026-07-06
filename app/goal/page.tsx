"use client";
import Link from "next/link";
import { useState } from "react";

export default function GoalPage() {
  const [goals, setGoals] = useState([""]);
  return (
    <main className="p-6">

      <h1 className="text-2xl font-bold">
        目標登録画面
      </h1>
      {goals.map((goal, index) => (
  <div key={index} className="mt-4">
    <label className="block mb-1 font-semibold">
      目標{index + 1}
    </label>

    <input
      type="text"
      value={goal}
      maxLength={20}
      className="border rounded w-full p-2"
      onChange={(e) => {
        const newGoals = [...goals];
        newGoals[index] = e.target.value;
        setGoals(newGoals);
}}
    />

  </div>
))}
    {goals.length < 3 && (
  <button
    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
    onClick={() => {
      setGoals([...goals, ""]);
    }}
  >
    ＋追加
  </button>
)}
<p className="mt-2 text-gray-500">
  残り{3 - goals.length}件登録できます
</p>
      <Link href="/home">
        <button className="mt-8 bg-gray-300 px-4 py-2 rounded">
          ←ホームへ戻る
        </button>
      </Link>

    </main>
  );
}