"use client";

import { useSearchParams } from "next/navigation";

export default function PostContent() {
  const searchParams = useSearchParams();

  const goalId = searchParams.get("id");

  return (
    <main className="p-4">
      <p>目標ID：{goalId}</p>
    </main>
  );
}