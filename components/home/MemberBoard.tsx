"use client";

import Link from "next/link";

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
  return (
    <div className="space-y-6">
      {members.map((member) => (
        <section
          key={member.id}
          className={`rounded-2xl border p-4 shadow-sm ${
            member.id === userId && !readonly
              ? "border-blue-300 bg-blue-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="mb-4 flex items-center gap-2">
            {member.id === userId && !readonly ? (
              <Link
                href="/profile"
                className="text-lg font-bold hover:text-blue-600"
              >
                 {member.display_name}
              </Link>
            ) : (
              <h2 className="text-lg font-bold">
                 {member.display_name}
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

                    

                        {latestPost.comment && (
                          <p className="mt-1 truncate text-[10px]">
                            {latestPost.comment}
                          </p>
                        )}

                        {!readonly &&
                          member.id === userId &&
                          startPost &&
                          !finishPost && (
                            <Link
                              href={`/post?goalId=${goal.id}&type=finish`}
                              className="mt-2 block rounded-full bg-green-500 px-2 py-1 text-center text-[11px] font-semibold text-white"
                            >
                              終わった！
                            </Link>
                          )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center p-2 text-center">
                      <p className="line-clamp-3 text-xs font-semibold">
                        {goal.goal_text}
                      </p>

                      {!readonly && member.id === userId && (
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

            {!readonly &&
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
                  <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-2 text-center">
                    <span className="text-2xl text-blue-500">＋</span>
                    <span className="mt-1 text-[11px] font-semibold text-blue-600">
                      目標を追加
                    </span>
                  </div>
                </Link>
              ))}
          </div>

          {readonly && member.goals.length === 0 && (
            <p className="mt-3 text-sm text-gray-400">
              この日は目標を登録していません
            </p>
          )}

          {!readonly &&
            member.id !== userId &&
            member.goals.length === 0 && (
              <p className="mt-3 text-sm text-gray-400">
                今日はまだ目標を登録していません
              </p>
            )}
        </section>
      ))}
    </div>
  );
}