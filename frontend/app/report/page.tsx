"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import AiAnalysisPanel from "../../components/AiAnalysisPanel";
import DuplicateCheck from "../../components/DuplicateCheck";
import { CATEGORIES, WARD_COORDS, WARDS } from "../../lib/demoData";
import {
  createComplaint, findDuplicates, mockAnalyse,
} from "../../lib/api";
import { addPoints } from "../../lib/store";
import type {
  AiResult, Category, Complaint, DuplicateMatch,
} from "../../lib/types";

type Step = "form" | "ai" | "duplicates" | "done";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ReportPage() {
  const [step, setStep] = useState<Step>("form");
  const [photoName, setPhotoName] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [category, setCategory] = useState<Category>("Pothole");
  const [description, setDescription] = useState("");
  const [ward, setWard] = useState(WARDS[0]);
  const [formError, setFormError] = useState("");
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [matches, setMatches] = useState<DuplicateMatch[]>([]);
  const [ticket, setTicket] = useState<Complaint | null>(null);
  const [supported, setSupported] = useState(false);
  const [points, setPoints] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const wardCoords = WARD_COORDS[ward] ?? [17.41, 78.46];

  function handlePhoto(file: File | undefined) {
    setPhotoError("");
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoError("Unsupported image format. Please use JPG, PNG or WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setPhotoError("Image too large. Maximum 5 MB.");
      return;
    }
    setPhotoName(file.name);
    setAiResult(mockAnalyse(file.name));
  }

  function handleAnalyse() {
    if (!photoName) {
      setPhotoError("Please attach a photo first.");
      return;
    }
    if (!description.trim()) {
      setFormError("Description is required.");
      return;
    }
    setFormError("");
    setStep("ai");
  }

  async function handleConfirmCategory(finalCategory: Category) {
    setCategory(finalCategory);
    const found = await findDuplicates({
      category: finalCategory,
      latitude: wardCoords[0],
      longitude: wardCoords[1],
      description,
    });
    setMatches(found);
    setStep("duplicates");
  }

  async function fileReport() {
    const created = await createComplaint({
      category,
      description,
      ward,
      address: `${ward} (location picked on map)`,
      latitude: wardCoords[0],
      longitude: wardCoords[1],
    });
    setTicket(created);
    setPoints(addPoints(50));
    setStep("done");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Report an issue</h1>
      <p className="text-sm text-gray-600">
        A photo, a category, a short description and a location — that is all
        it takes. Your report is unverified until an admin reviews it.
      </p>

      {step === "form" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyse();
          }}
          className="space-y-4 rounded-lg border bg-white p-4"
        >
          <div>
            <label className="font-medium" htmlFor="photo-input">Photo of the issue *</label>
            <input
              id="photo-input"
              data-testid="photo-input"
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-1 block w-full"
              onChange={(e) => handlePhoto(e.target.files?.[0])}
            />
            <p className="text-xs text-gray-500">JPG, PNG or WebP, max 5 MB. Faces and number plates are blurred in published content.</p>
            {photoName && <p className="text-sm text-teal-800">Attached: {photoName}</p>}
            {photoError && <p role="alert" className="text-sm text-red-700">{photoError}</p>}
            <div className="mt-2 flex gap-2">
              <button type="button" data-testid="sample-pothole" className="rounded border px-3 py-1 text-sm" onClick={() => { setPhotoName("pothole-sample.jpg"); setAiResult(mockAnalyse("pothole-sample.jpg")); }}>
                Use sample: pothole photo
              </button>
              <button type="button" data-testid="sample-garbage" className="rounded border px-3 py-1 text-sm" onClick={() => { setPhotoName("garbage-sample.jpg"); setAiResult(mockAnalyse("garbage-sample.jpg")); }}>
                Use sample: garbage photo
              </button>
            </div>
          </div>

          <div>
            <label className="font-medium" htmlFor="category-select">Category *</label>
            <select
              id="category-select"
              data-testid="category-select"
              className="mt-1 w-full rounded border px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="font-medium" htmlFor="description-input">Description *</label>
            <textarea
              id="description-input"
              data-testid="description-input"
              className="mt-1 w-full rounded border px-3 py-2"
              rows={3}
              minLength={10}
              placeholder="What is wrong, and where exactly?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium" htmlFor="ward-select">Ward *</label>
            <select
              id="ward-select"
              data-testid="ward-select"
              className="mt-1 w-full rounded border px-3 py-2"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
            >
              {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
            <p className="text-xs text-gray-500">
              Location: {wardCoords[0]}, {wardCoords[1]} (ward centre — pick the exact spot on the map in the full app).
            </p>
          </div>

          {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}

          <button type="submit" data-testid="submit-report" className="rounded bg-brand-teal px-5 py-2 font-semibold text-white hover:bg-teal-700">
            Analyse photo and continue
          </button>
        </form>
      )}

      {step === "ai" && aiResult && (
        <AiAnalysisPanel result={aiResult} onConfirm={handleConfirmCategory} />
      )}

      {step === "duplicates" && (
        <DuplicateCheck
          matches={matches}
          onSupport={(m) => {
            setSupported(true);
            setTicket(getTicketFor(m));
            setStep("done");
          }}
          onFileSeparately={fileReport}
        />
      )}

      {step === "done" && ticket && (
        <section data-testid="success-panel" className="rounded-lg border border-green-300 bg-green-50 p-5 text-center">
          <h2 className="text-xl font-bold text-green-900">
            {supported ? "Thanks — you supported an existing report" : "Report submitted"}
          </h2>
          <p className="mt-2">
            Your ticket number is{" "}
            <strong data-testid="ticket-number">{ticket.ticket_no}</strong>
          </p>
          <p className="text-sm text-green-900">
            Track it any time from the home page or the map. You earned +50 points
            {points > 0 ? ` (your total: ${points})` : ""}.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href={`/complaints/${ticket.id}`} className="rounded bg-brand-teal px-4 py-2 font-semibold text-white">
              Track this ticket
            </Link>
            <Link href="/map" className="rounded border px-4 py-2 font-semibold">
              View on map
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function getTicketFor(match: DuplicateMatch): Complaint {
  return {
    id: match.complaint_id,
    ticket_no: match.ticket_no,
    category: match.category,
    description: "",
    status: "SUBMITTED",
    severity: "Medium",
    ward: "",
    address: "",
    latitude: 0,
    longitude: 0,
    is_demo: true,
    created_at: new Date().toISOString(),
  };
}
