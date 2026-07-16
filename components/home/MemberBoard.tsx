"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Post = {
  id: string;
  post_type: "start" | "finish";
  photo_url: string;
  comment: string | null;
  created_at: string;
};

type Goal = {
  id: string;
  goal_text: string;
  goal_date: string;
  display_order: number;
  posts: Post[];
};

type Member = {
  id: string;
  display_name: string;
  goals: Goal[];
};

type MemberBoardProps = {
  members: Member[];
  userId?: string;
  readonly?: boolean;
  showEmptyGoalTiles?: boolean;
};

export default function MemberBoard({
  members,
  userId = "",
  readonly = false,
  showEmptyGoalTiles = false,
}: MemberBoardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true);
    }, 50);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div
      className={`space-y-3 transition-all duration-500 ease-out ${visible
          ? "translate-y-0 opacity-100"
          : "translate-y-2 opacity-0"
        } `}>
      {
        members.map((member) => (
          <section
            key={member.id}
            className={`rounded-2xl border p-3 shadow-sm ${member.id === userId && !readonly
              ? "border-blue-300 bg-blue-50"
              : "border-gray-200 bg-white"
              }`}
          >
            <div className="mb-2 flex items-center">
              {member.id === userId && !readonly ? (
                <Link
                  href="/profile"
                  className="text-sm font-semibold hover:text-blue-600"
                >
                  {member.display_name}
                </Link>
              ) : (
                <h2 className="text-sm font-semibold">
                  {member.display_name}
                </h2>
              )}
            </div>

            <div className="grid grid-cols-3">
              {member.goals.map((goal) => {
                const startPost = goal.posts.find(
                  (post) => post.post_type === "start"
                );

                const finishPost = goal.posts.find(
                  (post) => post.post_type === "finish"
                );

                const latestPost = finishPost ?? startPost;
                const isOwnGoal = member.id === userId;

                const tileContent = (
                  <div
                    className="aspect-square min-w-0 overflow-hidden rounded-lg border bg-white shadow-sm"
                  >
                    {latestPost ? (
                      <div className="relative h-full">
                        <img
                          src={latestPost.photo_url}
                          alt={goal.goal_text}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/45 text-[10px] font-bold text-white backdrop-blur-sm">
                          {finishPost ? "✓" : "▶"}
                        </div>

                        <div className="absolute bottom-2 left-2 right-2 text-white"
                          style={{
                            textShadow: "0 1px 6px rgba(0,0,0,0.9)",
                          }}>
                          <p className="truncate text-xs font-semibold">
                            {goal.goal_text}
                          </p>

                          {latestPost.comment && (
                            <p className="mt-1 truncate text-[10px]">
                              {latestPost.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center p-2 text-center">
                        <p className="line-clamp-3 text-xs font-semibold">
                          {finishPost ? "✓" : "▶"}
                          {goal.goal_text}
                        </p>

                        {isOwnGoal && (
                          <p className="mt-2 text-[10px] text-gray-400">
                            タップして始める
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
                if (!isOwnGoal || finishPost) {
                  return (
                    <div key={goal.id}>
                      {tileContent}
                    </div>
                  );
                }

                const href = startPost
                  ? `/post?goalId=${goal.id}&type=finish`
                  : `/post?goalId=${goal.id}&type=start`;

                return (
                  <Link key={goal.id} href={href} className="block">
                    {tileContent}
                  </Link>
                );
              })}
              {
                !readonly &&
                showEmptyGoalTiles &&
                member.id === userId &&
                Array.from({
                  length: Math.max(0, 3 - member.goals.length),
                }).map((_, index) => (
                  <Link
                    key={`empty-${index}`}
                    href="/goal"
                    className="aspect-square min-w-0"
                  >
                    <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-2 text-center">
                      <span className="text-2xl text-blue-500">＋</span>
                      <span className="mt-1 text-[11px] font-semibold text-blue-600">
                        目標を追加
                      </span>
                    </div>
                  </Link>
                ))
              }
            </div>

            {
              readonly && member.goals.length === 0 && (
                <p className="mt-3 text-sm text-gray-400">
                  この日は目標を登録していません
                </p>
              )
            }

            {
              !readonly &&
              member.id !== userId &&
              member.goals.length === 0 && (
                <p className="mt-3 text-sm text-gray-400">
                  今日はまだ目標を登録していません
                </p>
              )
            }
          </section >
        ))
      }
    </div >
  );
}