import type { StatusHistoryItem } from "../lib/types";
import { WORKFLOW } from "../lib/types";

interface Props {
  history: StatusHistoryItem[];
  currentStatus: string;
}

/** Append-only status timeline (Blueprint section 8). Citizens can view
 * progress but never edit it. */
export default function StatusTimeline({ history, currentStatus }: Props) {
  const done = new Set(
    history.map((h) => h.new_status),
  );
  const isTerminal = currentStatus === "REJECTED" || currentStatus === "DUPLICATE_MERGED";

  return (
    <section data-testid="status-timeline" aria-label="Status timeline">
      <h2 className="text-lg font-semibold">Status timeline</h2>
      <ol className="mt-3 space-y-2">
        {WORKFLOW.map((step) => {
          const reached = done.has(step) || step === currentStatus;
          return (
            <li key={step} className="flex items-start gap-3">
              <span
                aria-hidden
                className={`mt-1 h-3 w-3 shrink-0 rounded-full ${reached ? "bg-brand-teal" : "bg-gray-300"}`}
              />
              <span className={reached ? "font-semibold" : "text-gray-500"}>{step}</span>
            </li>
          );
        })}
        {isTerminal && (
          <li className="flex items-start gap-3">
            <span aria-hidden className="mt-1 h-3 w-3 shrink-0 rounded-full bg-red-500" />
            <span className="font-semibold text-red-700">{currentStatus}</span>
          </li>
        )}
      </ol>

      <h3 className="mt-4 font-semibold">History</h3>
      <ul className="mt-2 space-y-2 text-sm">
        {history.length === 0 && (
          <li className="text-gray-500">No status changes recorded yet.</li>
        )}
        {history.map((h, i) => (
          <li key={i} data-testid="history-item" className="rounded border bg-white p-3">
            <p>
              <strong>{h.old_status ?? "—"} → {h.new_status}</strong>
              {" · "}
              {new Date(h.created_at).toLocaleString("en-IN")}
            </p>
            {h.remarks && <p>{h.remarks}</p>}
            {h.reason && <p className="text-red-700">Reason: {h.reason}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
