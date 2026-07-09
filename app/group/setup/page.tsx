"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function GroupSetupPage() {
  const router = useRouter();

  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const createInviteCode = () => {
    return Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
  };

  // グループ作成
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

    const newInviteCode = createInviteCode();

    const { data: group, error } = await supabase
      .from("groups")
      .insert({
        name: groupName,
        invite_code: newInviteCode,
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

    alert(`グループを作成しました！\n招待コード：${newInviteCode}`);
    router.push("/home");
  };

  // グループ参加
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
    router.push("/home");
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        グループ設定
      </h1>

      {/* 作成 */}
      <div className="border rounded-xl p-5 mb-8">
        <h2 className="text-xl font-bold mb-4">
          グループを作成
        </h2>

        <input
          type="text"
          value={groupName}
          maxLength={20}
          placeholder="グループ名"
          onChange={(e) => setGroupName(e.target.value)}
          className="border rounded w-full p-3"
        />

        <button
          onClick={createGroup}
          className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg"
        >
          作成する
        </button>
      </div>

      {/* 参加 */}
      <div className="border rounded-xl p-5">
        <h2 className="text-xl font-bold mb-4">
          招待コードで参加
        </h2>

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
          className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg"
        >
          参加する
        </button>
      </div>
    </main>
  );
}