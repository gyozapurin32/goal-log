"use client";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

import { useState } from "react";

export default function GroupPage() {
  const router = useRouter();

  const createGroup = async () => {
    if (groupName.trim() === "") {
      alert("グループ名を入力してください");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("ログインしてください");
      return;
    }

    const inviteCode = createInviteCode();

    const { data: group, error } = await supabase
      .from("groups")
      .insert({
        name: groupName,
        invite_code: inviteCode,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("グループ作成に失敗しました");
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
      alert("プロフィール更新に失敗しました");
      return;
    }

    alert(`招待コード：${inviteCode}`);
    router.push("/home");
  };
  const [groupName, setGroupName] = useState("");
  const createInviteCode = () => {
    return Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        グループ作成
      </h1>

      <label className="block mb-2 font-semibold">
        グループ名
      </label>

      <input
        type="text"
        value={groupName}
        maxLength={20}
        onChange={(e) => setGroupName(e.target.value)}
        className="border rounded w-full p-3"
      />


      <button
        onClick={createGroup}
        className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg"
      >
        作成する
      </button>
    </main>
  );
}