"use client";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/home",
      },
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <button
        onClick={signIn}
        className="rounded-lg bg-blue-500 px-6 py-3 text-white"
      >
        Googleでログイン
      </button>
    </main>
  );
}