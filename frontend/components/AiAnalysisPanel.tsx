"use client";

import { useState } from "react";
import type { AiResult, Category } from "../lib/types";
import { CATEGORIES } from "../lib/demoData";

interface Props {
  result: AiResult;
  onConfirm: (category: Category) => void;
}

/** AI analysis panel (Blueprint section 7). The AI only suggests — the
 * citizen can correct the category, and low confidence flags human review. */
export default function AiAnalysisPanel({ result, onConfirm }: Props) {
  const [category, setCategory] = useState<Category>(result.predicted_category);
  const [corrected, setCorrected] = useState(false);

  return (
    <section
      data-testid="ai-panel"
      aria-label="AI analysis"
      className="rounded-lg border border-teal-200 bg-teal-50 p-4"
    >
      <h2 className="text-lg font-semibold text-brand-dark">AI analysis — suggestion only</h2>
      <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
        <div><dt className="font-medium">Suggested category</dt><dd data-testid="ai-category">{result.predicted_category}</dd></div>
        <div>
          <dt className="font-medium">Confidence</dt>
          <dd data-testid="ai-confidence">{Math.round(result.confidence * 100)}%</dd>
        </div>
        <div><dt className="font-medium">Severity estimate</dt><dd>{result.suggested_severity} (estimate, not verified)</dd></div>
        <div><dt className="font-medium">Visible evidence</dt><dd>{result.visible_evidence}</dd></div>
        <div><dt className="font-medium">Model</dt><dd>{result.model_version} · mode: {result.mode}</dd></div>
      </dl>

      {result.needs_human_review && (
        <p data-testid="ai-human-review" role="alert" className="mt-3 rounded bg-amber-100 px-3 py-2 text-sm font-medium text-amber-900">
          Low confidence — this report will be sent to human review.
        </p>
      )}

      <label className="mt-3 block text-sm font-medium" htmlFor="ai-correct-category">
        Correct the category if the AI got it wrong
      </label>
      <select
        id="ai-correct-category"
        data-testid="ai-correct-category"
        className="mt-1 w-full rounded border px-3 py-2"
        value={category}
        onChange={(e) => {
          setCategory(e.target.value as Category);
          setCorrected(e.target.value !== result.predicted_category);
        }}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      {corrected && (
        <p className="mt-1 text-sm text-teal-800">Your correction will be stored with the report.</p>
      )}

      <button
        type="button"
        data-testid="ai-confirm"
        onClick={() => onConfirm(category)}
        className="mt-4 rounded bg-brand-teal px-4 py-2 font-semibold text-white hover:bg-teal-700"
      >
        Confirm category and continue
      </button>
    </section>
  );
}
