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
  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .order("display_order");

    if (error) {
      console.error(error);
      return;
    }

    setGoals(data);
  };
  useEffect(() => {
    fetchGoals();
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
      <Link href="/goal">
        <button className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg">
          ＋目標を追加
        </button>
      </Link>

    </main>
  );
}