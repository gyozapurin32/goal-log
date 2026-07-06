import GoalCard from "@/components/goal/GoalCard";

export default function HomePage() {
  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">GoalLog</h1>

      <button className="mb-6 text-blue-600 font-semibold">
        チームA
      </button>

      <GoalCard
        title="簿記2級を30分勉強"
        status="未完了"
      />

      <GoalCard
        title="ジムへ行く"
        status="未完了"
      />

      <GoalCard
        title="読書20ページ"
        status="未完了"
      />

      <button className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg">
        ＋目標を追加
      </button>
    </main>
  );
}