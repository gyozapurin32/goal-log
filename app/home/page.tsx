"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import GoalCard from "@/components/goal/GoalCard";
type Goal = {
  id: string;
  goal_text: string;
  status: string;
  display_order: number;
};
export default function HomePage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log(user);
  };
  const createProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 既にプロフィールがあるか確認
    const { data: profile, error: selectError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    console.log("profile:", profile);
    console.log("select error:", selectError);

    if (profile) return;

    // なければ作成
    const { error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        display_name:
          user.user_metadata.full_name ??
          user.user_metadata.name ??
          "ユーザー",
      });

    if (error) {
      alert(error.message);
      console.error(error);
    } else {
      console.log("プロフィール作成成功");
    }
  };
  const fetchGoals = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("user:", user);

    if (!user) {
      console.log("ログインしていません");
      return;
    }

    const today = new Date().toISOString().split("T")[0];


    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("goal_date", today)
      .order("display_order");
    console.log("data:", data);
    console.log("error:", error);
    if (error) {
      console.error(error);
      return;
    }

    setGoals(data);
  };
  useEffect(() => {
    const init = async () => {
      await createProfile();
      await fetchGoals();
    };

    init();
  }, []);
  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">GoalLog</h1>

      <Link href="/group">
        <button className="mb-6 text-blue-600 font-semibold">
          チームA
        </button>
      </Link>
      {goals.map((goal) => (
        <Link key={goal.id} href={`/status?id=${goal.id}`}>
          <GoalCard
            title={goal.goal_text}
            status={goal.status}
          />
        </Link>
      ))}
      {goals.length < 3 ? (
        <Link href="/goal">
          <button className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg">
            ＋目標を追加
          </button>
        </Link>
      ) : (
        <p className="mt-6 text-center text-gray-500">
          今日の目標は登録済みです！
        </p>
      )}

    </main>
  );
}