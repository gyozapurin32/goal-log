"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { STATUS } from "@/lib/status";
import { getGoalDate } from "@/lib/goalDate";

type Goal = {
  id: string;
  goal_text: string;
};

export default function GoalPage() {
  const router = useRouter();

  const [existingGoals, setExistingGoals] = useState<Goal[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const remainingCount =
    3 - existingGoals.length - goals.length;

  const fetchExistingGoals = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/");
      return;
    }

    const today = getGoalDate();

    const { data, error } = await supabase
      .from("goals")
      .select("id, goal_text")
      .eq("user_id", user.id)
      .eq("goal_date", today)
      .order("display_order");

    if (error) {
      console.error(error);
      alert("登録済みの目標を取得できませんでした");
      setLoading(false);
      return;
    }

    const existing = data ?? [];

    setExistingGoals(existing);

    if (existing.length < 3) {
      setGoals([""]);
    } else {
      setGoals([]);
    }

    setLoading(false);
  };

  const saveGoals = async () => {
    const newGoals = goals
      .map((goal) => goal.trim())
      .filter((goal) => goal !== "");

    if (newGoals.length === 0) {
      alert("新しい目標を入力してください");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("ログインしてください");
      setSaving(false);
      return;
    }

    const today = getGoalDate();

    const { count, error: countError } = await supabase
      .from("goals")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id)
      .eq("goal_date", today);

    if (countError) {
      console.error(countError);
      alert("登録数の確認に失敗しました");
      setSaving(false);
      return;
    }

    const existingCount = count ?? 0;

    if (existingCount >= 3) {
      alert("今日はすでに3件登録しています");
      setSaving(false);
      router.push("/home");
      return;
    }

    if (existingCount + newGoals.length > 3) {
      alert("1日に登録できる目標は3件までです");
      setSaving(false);
      return;
    }

    const insertData = newGoals.map(
      (goal, index) => ({
        user_id: user.id,
        goal_text: goal,
        status: STATUS.NOT_STARTED,
        display_order: existingCount + index + 1,
        goal_date: today,
      })
    );

    const { error } = await supabase
      .from("goals")
      .insert(insertData);

    if (error) {
      console.error(error);
      alert("保存に失敗しました");
      setSaving(false);
      return;
    }

    alert("今日も頑張ろう！ 🎉");
    router.push("/home");
  };

  useEffect(() => {
    fetchExistingGoals();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">
          読み込み中...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-md p-6">
        {/* タイトル */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-500">
            TODAY&apos;S GOALS
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            🎯 今日の目標
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {existingGoals.length >= 3
              ? "今日の目標はすべて登録済みです"
              : `あと${3 - existingGoals.length}件登録できます`}
          </p>
        </div>

        {/* 登録済み */}
        {existingGoals.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-3 text-sm font-semibold text-gray-500">
              登録済み
            </h2>

            <div className="space-y-2">
              {existingGoals.map((goal, index) => (
                <div
                  key={goal.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>

                  <p className="font-semibold text-gray-800">
                    {goal.goal_text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 新しい目標 */}
        {goals.length > 0 && (
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-bold text-gray-800">
                新しい目標
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                今日やることを宣言しよう
              </p>
            </div>

            <div className="space-y-4">
              {goals.map((goal, index) => {
                const goalNumber =
                  existingGoals.length + index + 1;

                return (
                  <div key={index}>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-600">
                        目標 {goalNumber}
                      </label>

                      <span className="text-xs text-gray-400">
                        {goal.length}/20
                      </span>
                    </div>

                    <input
                      type="text"
                      value={goal}
                      maxLength={20}
                      placeholder="例：簿記を30分勉強する"
                      onChange={(event) => {
                        const newGoals = [...goals];
                        newGoals[index] =
                          event.target.value;
                        setGoals(newGoals);
                      }}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                );
              })}
            </div>

            {remainingCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  setGoals([...goals, ""])
                }
                className="mt-5 w-full rounded-xl border-2 border-dashed border-blue-200 py-3 text-sm font-semibold text-blue-500 transition hover:bg-blue-50"
              >
                ＋ もう1件追加
              </button>
            )}
          </section>
        )}

        {/* 保存 */}
        {existingGoals.length < 3 && (
          <button
            type="button"
            onClick={saveGoals}
            disabled={saving}
            className="mt-6 w-full rounded-xl bg-blue-500 py-4 font-bold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "保存中..."
              : "今日の目標を保存する"}
          </button>
        )}

        <button
          type="button"
          onClick={() => router.push("/home")}
          disabled={saving}
          className="mt-3 w-full rounded-xl py-3 text-sm font-semibold text-gray-500 transition hover:bg-gray-200"
        >
          ホームへ戻る
        </button>
      </div>
    </main>
  );
}