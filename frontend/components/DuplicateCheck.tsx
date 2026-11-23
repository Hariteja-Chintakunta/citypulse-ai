"use client";

import type { DuplicateMatch } from "../lib/types";

interface Props {
  matches: DuplicateMatch[];
  onSupport: (match: DuplicateMatch) => void;
  onFileSeparately: () => void;
}

/** Duplicate check (Blueprint section 7). A nearby issue is not
 * automatically the same defect — the citizen chooses. */
export default function DuplicateCheck({ matches, onSupport, onFileSeparately }: Props) {
  if (matches.length === 0) {
    return (
      <section data-testid="duplicate-panel" className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h2 className="font-semibold text-green-900">No possible duplicates found</h2>
        <p className="text-sm text-green-800">No similar open issue was found nearby. You can file this as a new report.</p>
        <button
          type="button"
          data-testid="duplicate-file-separately"
          onClick={onFileSeparately}
          className="mt-3 rounded bg-brand-teal px-4 py-2 font-semibold text-white"
        >
          File as a new report
        </button>
      </section>
    );
  }

  return (
    <section data-testid="duplicate-panel" aria-label="Possible duplicates" className="rounded-lg border border-amber-300 bg-amber-50 p-4">
      <h2 className="font-semibold text-amber-900">Possible duplicate nearby</h2>
      <p className="text-sm text-amber-800">
        A similar issue was already reported close by. You can support the existing ticket instead of filing a new one — or file separately if this is a different problem.
      </p>
      <ul className="mt-3 space-y-2">
        {matches.map((m) => (
          <li key={m.complaint_id} data-testid="duplicate-match" className="rounded border bg-white p-3 text-sm">
            <p className="font-semibold">{m.ticket_no} — {m.category}</p>
            <p>{m.distance_m} m away · similarity {Math.round(m.similarity * 100)}%</p>
            <button
              type="button"
              data-testid="duplicate-support"
              onClick={() => onSupport(m)}
              className="mt-2 rounded bg-amber-600 px-3 py-1 font-semibold text-white"
            >
              Support this ticket
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        data-testid="duplicate-file-separately"
        onClick={onFileSeparately}
        className="mt-3 rounded bg-brand-teal px-4 py-2 font-semibold text-white"
      >
        This is a different issue — file separately
      </button>
    </section>
  );
}
