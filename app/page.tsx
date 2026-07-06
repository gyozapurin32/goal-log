import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-80 text-center">
        <h1 className="text-3xl font-bold mb-2">GoalLog</h1>
        <p className="text-gray-500 mb-8">
          毎日の目標を仲間と共有しよう
        </p>
        <Link href="/home">
        <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">
          Googleでログイン
        </button>
        </Link>
      </div>
    </main>
  );
}