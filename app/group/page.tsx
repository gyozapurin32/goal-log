"use client";

import { useState } from "react";

export default function GroupPage() {
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
        className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg"
      >
        作成する
      </button>
    </main>
  );
}