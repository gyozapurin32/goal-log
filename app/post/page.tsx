"use client";

import { ChangeEvent, Suspense, useState, useEffect, } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
export default function PostPage() {

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100">
          <div className="max-w-md mx-auto p-6">
            <p>読み込み中...</p>
          </div>
        </main>
      }
    >
      <PostContent />
    </Suspense>
  );
}

function PostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goalId = searchParams.get("goalId");
  const [goalText, setGoalText] = useState("");
  const postType = searchParams.get("type");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [comment, setComment] = useState("");
  const fetchGoal = async () => {
    if (!goalId) return;

    const { data, error } = await supabase
      .from("goals")
      .select("goal_text")
      .eq("id", goalId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setGoalText(data.goal_text);
  };

  useEffect(() => {
    fetchGoal();
  }, [goalId]);

  const selectPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const submitPost = async () => {
    if (!goalId) {
      alert("目標が見つかりません");
      return;
    }

    if (postType !== "start" && postType !== "finish") {
      alert("投稿種別が正しくありません");
      return;
    }

    if (!file) {
      alert("写真を選択してください");
      return;
    }

    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("ログインしてください");
      setUploading(false);
      return;
    }

    const fileExtension = file.name.split(".").pop() ?? "jpg";

    const filePath =
      `${user.id}/${goalId}/${postType}-${crypto.randomUUID()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("goal-photos")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError);
      alert(`写真の保存に失敗しました：${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("goal-photos")
      .getPublicUrl(filePath);

    const { error: postError } = await supabase
      .from("posts")
      .insert({
        goal_id: goalId,
        user_id: user.id,
        post_type: postType,
        photo_url: publicUrlData.publicUrl,
        comment: comment.trim() || null,
      });

    if (postError) {
      console.error(postError);
      alert(`投稿に失敗しました：${postError.message}`);
      setUploading(false);
      return;
    }

    alert(
      postType === "start"
        ? "今から！を投稿しました"
        : "終わった！を投稿しました"
    );

    router.push("/home");
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold">
          {postType === "finish" ? "終わった！" : "今から！"}
        </h1>
        <div className="mt-4 rounded-xl bg-white p-4 shadow">
          <p className="text-xs text-gray-500">
            今日の目標
          </p>

          <p className="mt-1 text-lg font-bold">
            🎯 {goalText}
          </p>
        </div>

        <p className="mt-2 text-gray-500">
          写真を撮るか、スマホから選択してください
        </p>

        <label className="block mt-6 cursor-pointer">
          <div className="aspect-square rounded-2xl border-2 border-dashed bg-white flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="投稿写真のプレビュー"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-gray-400">
                📷 写真を選択
              </span>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={selectPhoto}
            className="hidden"
          />
        </label>

        <textarea
          value={comment}
          maxLength={40}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            postType === "start"
              ? "例：ジム行ってきます"
              : "例：終わった！むきむき"
          }
          className="mt-4 w-full rounded-lg border p-3"
        />

        <p className="mt-1 text-right text-xs text-gray-400">
          {comment.length}/40
        </p>

        <button
          type="button"
          onClick={submitPost}
          disabled={uploading}
          className="w-full mt-6 rounded-lg bg-blue-500 py-3 text-white disabled:opacity-50"
        >
          {uploading ? "投稿中..." : "投稿する"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          disabled={uploading}
          className="w-full mt-3 rounded-lg bg-gray-300 py-3"
        >
          戻る
        </button>
      </div>
    </main>
  );
}