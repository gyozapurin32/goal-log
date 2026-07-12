"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [isExistingProfile, setIsExistingProfile] = useState(false);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setDisplayName(data.display_name);
      setIsExistingProfile(true);
    }

    setDisplayName(data.display_name);
  };

  const saveProfile = async () => {
    if (displayName.trim() === "") {
      alert("ユーザー名を入力してください");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    const { error } = existingProfile
      ? await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", user.id)
      : await supabase
        .from("profiles")
        .insert({
          id: user.id,
          display_name: displayName,
        });

    if (error) {
      alert("保存に失敗しました");
      console.error(error);
      return;
    }

    if (isExistingProfile) {
      router.push("/home");
    } else {
      router.push("/group/setup");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        プロフィール設定
      </h1>

      <label className="block mb-2 font-semibold">
        ユーザー名
      </label>

      <input
        type="text"
        value={displayName}
        maxLength={20}
        onChange={(e) => setDisplayName(e.target.value)}
        className="border rounded w-full p-3"
        placeholder="例：替玉みさぼ"
      />

      <button
        onClick={saveProfile}
        className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg"
      >
        保存する
      </button>
    </main>
  );
}