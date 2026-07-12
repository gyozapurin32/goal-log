"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { supabase } from "@/lib/supabase";
import { getGoalDate } from "@/lib/goalDate";
import type { Member } from "@/lib/types";
import MemberBoard from "@/components/home/MemberBoard";

type GroupHistoryProps = {
  groupId: string;
};

export default function GroupHistory({
  groupId,
}: GroupHistoryProps) {
  const initialDate = new Date();
  initialDate.setDate(initialDate.getDate() - 1);

  const [selectedDate, setSelectedDate] =
    useState<Date>(initialDate);

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const goalDate = getGoalDate(selectedDate);

  const dateLabel = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(selectedDate);

  const fetchHistory = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        display_name,
        goals(
          id,
          goal_text,
          goal_date,
          display_order,
          posts(
            id,
            post_type,
            photo_url,
            comment,
            created_at
          )
        )
      `)
      .eq("group_id", groupId);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const historyMembers: Member[] = (data ?? []).map(
      (member) => ({
        ...member,
        goals: member.goals
          .filter((goal) => goal.goal_date === goalDate)
          .sort(
            (a, b) => a.display_order - b.display_order
          ),
      })
    );

    setMembers(historyMembers);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [groupId, goalDate]);

  const totalGoalCount = members.reduce(
    (total, member) => total + member.goals.length,
    0
  );

  const completedGoalCount = members.reduce(
    (total, member) =>
      total +
      member.goals.filter((goal) =>
        goal.posts.some(
          (post) => post.post_type === "finish"
        )
      ).length,
    0
  );

  return (
    <div>
      <div className="mb-5 rounded-xl bg-white p-3 shadow-sm">
        <Calendar
          value={selectedDate}
          maxDate={new Date()}
          onChange={(value) => {
            if (value instanceof Date) {
              setSelectedDate(value);
            }
          }}
        />
      </div>

      <div className="mb-5 rounded-xl border bg-white p-4">
        <p className="text-sm text-gray-500">
          {dateLabel}
        </p>

        <p className="mt-1 font-semibold">
          {totalGoalCount === 0
            ? "この日の目標はありません"
            : `${completedGoalCount} / ${totalGoalCount} 完了`}
        </p>
      </div>

      {loading ? (
        <p className="py-8 text-center text-gray-500">
          読み込み中...
        </p>
      ) : (
        <MemberBoard members={members} readonly />
      )}
    </div>
  );
}