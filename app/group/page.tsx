"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Member = {
  id: string;
  display_name: string;
};

export default function GroupPage() {
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [userId, setUserId] = useState("");

  const fetchGroup = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("group_id")
      .eq("id", user.id)
      .single();

    if (!profile?.group_id) return;

    const { data: group } = await supabase
      .from("groups")
      .select("*")
      .eq("id", profile.group_id)
      .single();

    if (group) {
      setGroupName(group.name);
      setInviteCode(group.invite_code);
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, display_name")
      .eq("group_id", profile.group_id);

    if (data) {
      setMembers(data);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">
        {groupName}
      </h1>

      <p className="mt-3">
        招待コード
      </p>

      <div className="border rounded p-3 font-bold text-center text-lg">
        {inviteCode}
      </div>

      <h2 className="mt-8 mb-3 font-semibold">
        メンバー
      </h2>

      {members.map((member) => (
        <div
          key={member.id}
          className="border rounded-lg p-4 mt-3"
        >
          {member.id === userId ? (
            <Link
              href="/profile"
              className="flex items-center justify-between font-semibold hover:text-blue-600"
            >
              <span>👤 {member.display_name}</span>
              <span className="text-gray-400">›</span>
            </Link>
          ) : (
            <span className="font-semibold">
              👤 {member.display_name}
            </span>
          )}
        </div>
      ))}

      <Link href="/home">
        <button className="w-full mt-6 bg-gray-300 py-3 rounded-lg">
          ホームへ戻る
        </button>
      </Link>
    </main>
  );
}