"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import GroupHistory from "@/components/group/GroupHistory";

type Member = {
  id: string;
  display_name: string;
};

type Tab = "members" | "history";

export default function GroupPage() {
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [userId, setUserId] = useState("");

  const [activeTab, setActiveTab] =
    useState<Tab>("members");

  const fetchGroup = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUserId(user.id);

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("group_id")
        .eq("id", user.id)
        .single();

    if (profileError) {
      console.error(profileError);
      return;
    }

    if (!profile?.group_id) return;

    setGroupId(profile.group_id);

    const { data: group, error: groupError } =
      await supabase
        .from("groups")
        .select("name, invite_code")
        .eq("id", profile.group_id)
        .single();

    if (groupError) {
      console.error(groupError);
      return;
    }

    setGroupName(group.name);
    setInviteCode(group.invite_code);

    const { data: memberData, error: memberError } =
      await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("group_id", profile.group_id);

    if (memberError) {
      console.error(memberError);
      return;
    }

    setMembers(memberData ?? []);
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-md p-6">
        <div className="mb-5 rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">
            あなたのグループ
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            🏆 {groupName}
          </h1>
        </div>

        {/* タブ */}
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-gray-200 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`rounded-lg py-2 text-sm font-semibold ${
              activeTab === "members"
                ? "bg-white shadow"
                : "text-gray-500"
            }`}
          >
            メンバー・招待
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`rounded-lg py-2 text-sm font-semibold ${
              activeTab === "history"
                ? "bg-white shadow"
                : "text-gray-500"
            }`}
          >
            過去のボード
          </button>
        </div>

        {/* メンバー・招待タブ */}
        {activeTab === "members" && (
          <div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">
                招待コード
              </p>

              <div className="mt-2 rounded-lg border p-3 text-center text-xl font-bold tracking-widest">
                {inviteCode}
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(inviteCode);
                  alert("招待コードをコピーしました");
                }}
                className="mt-3 w-full rounded-lg bg-blue-500 py-2 text-white"
              >
                コードをコピー
              </button>
            </div>

            <h2 className="mb-3 mt-7 font-semibold">
              メンバー
            </h2>

            {members.map((member) => (
              <div
                key={member.id}
                className="mt-3 rounded-lg border bg-white p-4"
              >
                {member.id === userId ? (
                  <Link
                    href="/profile"
                    className="flex items-center justify-between font-semibold hover:text-blue-600"
                  >
                    <span>
                      👤 {member.display_name}
                    </span>

                    <span className="text-gray-400">
                      ›
                    </span>
                  </Link>
                ) : (
                  <span className="font-semibold">
                    👤 {member.display_name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 過去のボードタブ */}
        {activeTab === "history" && groupId && (
          <GroupHistory groupId={groupId} />
        )}

        <Link
          href="/home"
          className="mt-6 block w-full rounded-lg bg-gray-300 py-3 text-center font-semibold"
        >
          今日のボードへ戻る
        </Link>
      </div>
    </main>
  );
}