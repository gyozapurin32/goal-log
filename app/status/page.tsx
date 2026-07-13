"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { STATUS, STATUS_LIST } from "@/lib/status";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Status = (typeof STATUS)[keyof typeof STATUS];

export default function GoalPage() {
  return (
    <Suspense
      fallback={
        <main className="p-6">
          <p>読み込み中...</p>
        </main>
      }
    >
      <GoalContent />
    </Suspense>
  );
}

function GoalContent() {
  const [status, setStatus] = useState<Status>(STATUS.NOT_STARTED);

  const searchParams = useSearchParams();
  const goalId = searchParams.get("id");
  const router = useRouter();

  useEffect(() => {
    if (!goalId) return;

    const fetchGoal = async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("id", goalId)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setStatus(data.status);
    };

    fetchGoal();
  }, [goalId]);

  const updateStatus = async () => {
    if (!goalId) {
      alert("目標が見つかりません");
      return;
    }

    const { error } = await supabase
      .from("goals")
      .update({
        status: status,
      })
      .eq("id", goalId);

    if (error) {
      alert("更新に失敗しました");
      console.error(error);
      return;
    }

    alert("更新しました");
    router.push("/home");
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">
        ステータス画面
      </h1>

      <div className="mt-6">
        <h2 className="font-semibold mb-3">
          現在のステータス
        </h2>

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

      <button
        type="button"
        onClick={updateStatus}
        className="mt-8 bg-gray-300 px-4 py-2 rounded"
      >
        更新する
      </button>

      <Link
        href="/home"
        className="inline-block ml-3 mt-8 bg-gray-300 px-4 py-2 rounded"
      >
        ←ホームへ戻る
      </Link>
    </main>
  );
}