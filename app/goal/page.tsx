"use client";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useState } from "react";
import { STATUS } from "@/lib/status";

export default function GoalPage() {
  const saveGoals = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("ログインしてください");
      return;
    }
    const today = new Date().toISOString().split("T")[0];

    const { count, error: countError } = await supabase
      .from("goals")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("goal_date", today);

    if (countError) {
      alert("登録数の確認に失敗しました");
      console.error(countError);
      return;
    }
    if ((count ?? 0) >= 3) {
      alert("今日はすでに3件登録しています！");
      return;
    }
    const insertData = goals
      .filter((goal) => goal.trim() !== "")
      .map((goal, index) => ({
        user_id: user.id,
        goal_text: goal,
        status: STATUS.NOT_STARTED,
        display_order: index + 1,
        goal_date: new Date().toISOString().split("T")[0],
      }));
    if ((count ?? 0) + insertData.length > 3) {
      alert("1日に登録できる目標は3件までです。");
      return;
    }

    const { error } = await supabase.from("goals").insert(insertData);

    console.log(error);
    if (error) {
      alert("保存に失敗しました");
      console.error(error);
      return;
    }

    alert("保存しました！");
    router.push("/home");
  };
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
      <button
        onClick={saveGoals}
        className="mt-8 bg-blue-500 text-white px-4 py-2 rounded"
      >
        OK
      </button>

    </main>
  );
}