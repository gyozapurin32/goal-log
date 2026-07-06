export const STATUS = {
  NOT_STARTED: "未着手",
  IN_PROGRESS: "進行中",
  COMPLETED: "完了",
} as const;

export const STATUS_LIST = [
  { value: STATUS.NOT_STARTED, icon: "⚪" },
  { value: STATUS.IN_PROGRESS, icon: "🟡" },
  { value: STATUS.COMPLETED, icon: "🟢" },
];