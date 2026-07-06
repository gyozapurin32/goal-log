type GoalCardProps = {
  title: string;
  status: string;
};

export default function GoalCard({ title, status }: GoalCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm mb-3">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-gray-500">{status}</div>
    </div>
  );
}