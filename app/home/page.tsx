"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";


type Post = {
  id: string;
  post_type: "start" | "finish";
  photo_url: string;
  created_at: string;
};

type Goal = {
  id: string;
  goal_text: string;
  status: string;
  goal_date: string;
  display_order: number;
  posts: Post[];
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
                🏆 {groupName}
              </p>

              <p className="text-sm font-semibold text-gray-600">
                {totalGoalCount === 0
                  ? "まだ目標はありません"
                  : `${completedGoalCount} / ${totalGoalCount} 完了`}
              </p>
            </div>
          </div>
        </Link>

        <div className="space-y-6">
          {members.map((member) => (
            <section
              key={member.id}
              className={`rounded-2xl border p-4 shadow-sm ${member.id === userId
                ? "border-blue-300 bg-blue-50"
                : "border-gray-200 bg-white"
                }`}
            >
              <div className="mb-4 flex items-center gap-2">
                {member.id === userId ? (
                  <Link
                    href="/profile"
                    className="text-lg font-bold hover:text-blue-600"
                  >
                    👤 {member.display_name}
                  </Link>
                ) : (
                  <h2 className="text-lg font-bold">
                    👤 {member.display_name}
                  </h2>
                )}


              </div>

              <div className="grid grid-cols-3 gap-2">
                {member.goals.map((goal) => {
                  const startPost = goal.posts.find(
                    (post) => post.post_type === "start"
                  );

                  const finishPost = goal.posts.find(
                    (post) => post.post_type === "finish"
                  );

                  const latestPost = finishPost ?? startPost;

                  return (
                    <div
                      key={goal.id}
                      className="aspect-square min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm"
                    >
                      {latestPost ? (
                        <div className="relative h-full">
                          <img
                            src={latestPost.photo_url}
                            alt={goal.goal_text}
                            className="h-full w-full object-cover"
                          />

                          <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-white">
                            <p className="truncate text-xs font-semibold">
                              {goal.goal_text}
                            </p>

                            <p className="text-[11px]">
                              {finishPost ? "完了" : "進行中"}
                            </p>

                            {member.id === userId && startPost && !finishPost && (
                              <Link
                                href={`/post?goalId=${goal.id}&type=finish`}
                                className="mt-2 block rounded-full bg-green-500 px-2 py-1 text-center text-[11px] font-semibold text-white"
                              >
                                完了を記録
                              </Link>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center p-2 text-center">
                          <p className="line-clamp-3 text-xs font-semibold">
                            {goal.goal_text}
                          </p>

                          {member.id === userId && (
                            <Link
                              href={`/post?goalId=${goal.id}&type=start`}
                              className="mt-2 rounded-full bg-blue-500 px-2 py-1 text-[11px] text-white"
                            >
                              始める
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {member.id === userId &&
                  Array.from({ length: 3 - member.goals.length }).map((_, index) => (
                    <Link
                      key={`empty-${index}`}
                      href="/goal"
                      className="aspect-square min-w-0"
                    >
                      <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-2 text-center">
                        <span className="text-2xl text-blue-500">＋</span>
                        <span className="mt-1 text-[11px] font-semibold text-blue-600">
                          目標を追加
                        </span>
                      </div>
                    </Link>
                  ))}

                {member.id !== userId && member.goals.length === 0 && (
                  <div className="col-span-3 py-4 text-sm text-gray-400">
                    今日はまだ目標を登録していません
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

      </div>



    </main>
  );
}