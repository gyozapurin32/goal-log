import Link from "next/link";

export default function GoalPage() {
  return (
    <main className="p-6">

      <h1 className="text-2xl font-bold">
        結果画面
      </h1>

      <Link href="/home">
        <button className="mt-8 bg-gray-300 px-4 py-2 rounded">
          ←ホームへ戻る
        </button>
      </Link>

    </main>
  );
}