"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MemberBoard from "@/components/home/MemberBoard";
import { Goal, Post, Member } from "@/lob/types";

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
  const todayLabel = new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());

  const totalGoalCount = members.reduce(
    (total, member) => total + member.goals.length,
    0
  );

  const completedGoalCount = members.reduce(
    (total, member) =>
      total +
      member.goals.filter((goal) =>
        goal.posts.some((post) => post.post_type === "finish")
      ).length,
    0
  );


  // 初回だけプロフィール作成
  const createProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      router.push("/profile");
      return false;
    }

    return true;
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
      display_order,
      posts(
      id,
      post_type,
      photo_url,
      comment,
      created_at
      )
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
      const hasProfile = await createProfile();

      if (!hasProfile) return;

      await fetchHome();
    };

    init();
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
          <div className="mb-6 cursor-pointer rounded-xl bg-white p-4 shadow hover:bg-gray-50">
            <p className="text-sm text-gray-500">
              {todayLabel}
            </p>

            <div className="mt-1 flex items-end justify-between">
              <p className="text-lg font-bold">
                 {groupName}
              </p>

              <p className="text-sm font-semibold text-gray-600">
                {totalGoalCount === 0
                  ? "まだ目標はありません"
                  : `${completedGoalCount} / ${totalGoalCount} 完了`}
              </p>
            </div>
          </div>
        </Link>

        <MemberBoard
          members={members}
          userId={userId}
          showEmptyGoalTiles
        />
        


      </div>



    </main>
  );
}