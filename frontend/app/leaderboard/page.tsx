import { DEMO_LEADERBOARD } from "../../lib/demoData";
import { getMyPoints } from "../../lib/store";

export const dynamic = "force-dynamic";

export default function LeaderboardPage() {
  const myPoints = getMyPoints();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Citizen leaderboard</h1>
      <p className="text-sm text-gray-600">
        Points recognise citizens who report and follow up. +50 points per
        report, +20 when a report is verified, +100 when it is resolved.
        Demo data.
      </p>
      {myPoints > 0 && (
        <p data-testid="my-points" className="rounded bg-teal-50 border border-teal-200 p-3 text-sm">
          Your points this session: <strong>{myPoints}</strong>
        </p>
      )}
      <ol data-testid="leaderboard-table" className="space-y-2">
        {DEMO_LEADERBOARD.map((entry, i) => (
          <li key={entry.name} className="flex justify-between rounded-lg border bg-white p-4">
            <span><strong>#{i + 1}</strong> {entry.name}</span>
            <strong>{entry.points} pts</strong>
          </li>
        ))}
      </ol>
    </div>
  );
}
