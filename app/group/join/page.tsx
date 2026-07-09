"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function JoinGroupPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");

  const joinGroup = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("ログインしてください");
      return;
    }

    const { data: group, error } = await supabase
      .from("groups")
      .select("*")
      .eq("invite_code", inviteCode)
      .single();

    if (error || !group) {
      alert("招待コードが見つかりません");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        group_id: group.id,
      })
      .eq("id", user.id);

    if (profileError) {
      console.error(profileError);
      alert("参加に失敗しました");
      return;
    }

    alert(`${group.name} に参加しました！`);
    router.push("/group");
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        グループに参加
      </h1>

      <input
        type="text"
        value={inviteCode}
        maxLength={6}
        placeholder="招待コード"
        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
        className="border rounded w-full p-3 uppercase"
      />

      <button
        onClick={joinGroup}
        className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg"
      >
        参加する
      </button>
    </main>
  );
}