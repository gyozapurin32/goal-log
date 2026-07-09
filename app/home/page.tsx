"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import GoalCard from "@/components/goal/GoalCard";
import { useRouter } from "next/navigation";

type Goal = {
  id: string;
  goal_text: string;
  status: string;
  goal_date: string;
  display_order: number;
};

type Member = {
  id: string;
  display_name: string;
  goals: Goal[];
};

export default function HomePage() {
  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const router = useRouter();

  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [userId, setUserId] = useState("");
  const myGoals =
    members.find((member) => member.id === userId)?.goals ?? [];


  // 初回だけプロフィール作成
  const createProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) return;

    await supabase.from("profiles").insert({
      id: user.id,
      display_name:
        user.user_metadata.full_name ??
        user.user_metadata.name ??
        "ユーザー",
    });
  };

  const fetchHome = async () => {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    setUserId(user.id);

    // 自分のプロフィール取得
    const { data: profile } = await supabase
      .from("profiles")
      .select("group_id")
      .eq("id", user.id)
      .single();

    // グループ未所属ならsetupへ
    if (!profile?.group_id) {
      router.push("/group/setup");
      return;
    }

    // グループ取得
    const { data: group } = await supabase
      .from("groups")
      .select("*")
      .eq("id", profile.group_id)
      .single();

    if (group) {
      setGroupName(group.name);
    }

    // メンバー取得
    const { data, error } = await supabase
      .from("profiles")
      .select(`
    id,
    display_name,
    goals(
      id,
      goal_text,
      status,
      goal_date,
      display_order
    )
  `)
      .eq("group_id", profile.group_id);

    if (error) {
      console.error(error);
      return;
    }
    const today = new Date().toISOString().split("T")[0];

    const members: Member[] = data
      .map((member) => ({
        ...member,
        goals: member.goals
          .filter((goal) => goal.goal_date === today)
          .sort((a, b) => a.display_order - b.display_order),
      }))
      .sort((a, b) => {
        if (a.id === user.id) return -1;
        if (b.id === user.id) return 1;
        return 0;
      });

    setMembers(members);

  }
  useEffect(() => {
    const init = async () => {
      await createProfile();
      await fetchHome();
    };

    init();

    const channel = supabase
      .channel("goals-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "goals",
        },
        () => {
          fetchHome();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            GoalLog
          </h1>

          <button
            onClick={logout}
            className="text-sm text-red-500"
          >
            ログアウト
          </button>
        </div>

        <Link href="/group">
          <div className="bg-white rounded-xl shadow p-4 mb-6 cursor-pointer hover:bg-gray-50">
            <p className="text-sm text-gray-500">
              あなたのグループ
            </p>

            <p className="text-lg font-bold">
              🏆 {groupName}
            </p>
          </div>
        </Link>

        {members.map((member) => (
          <div
            key={member.id}
            className={`rounded-xl shadow p-4 mb-6 border ${member.id === userId
              ? "bg-blue-50 border-blue-300"
              : "bg-white"
              }`}
          >
            <h2 className="font-bold text-lg mb-3">
              👤 {member.display_name}
            </h2>


            {member.goals.length === 0 ? (
              <p className="text-gray-400 text-sm">
                今日はまだ目標を登録していません
              </p>
            ) : (
              member.goals.map((goal) =>
                member.id === userId ? (
                  <Link key={goal.id} href={`/status?id=${goal.id}`}>
                    <GoalCard
                      title={goal.goal_text}
                      status={goal.status}
                    />
                  </Link>
                ) : (
                  <GoalCard
                    key={goal.id}
                    title={goal.goal_text}
                    status={goal.status}
                  />
                )
              )
            )}
            {member.id === userId && (
              myGoals.length < 3 ? (
                <Link href="/goal">
                  <button className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg">
                    ＋目標を追加
                  </button>
                </Link>
              ) : (
                <p className="mt-4 text-center text-gray-500 text-sm">
                  今日の目標は登録済みです！
                </p>
              )
            )}


          </div>
        ))}


      </div >
    </main>
  );
}