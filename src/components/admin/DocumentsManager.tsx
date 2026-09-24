"use client";

import { useEffect, useState } from "react";
import type { DbDocument, DocumentType, GceLevel } from "@/lib/types";
import { questionsOnlyPrice, schemeOnlyPrice } from "@/lib/pricing";
import { joinPaperLabel, splitPaperLabel } from "@/lib/paperLabel";

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021];

function defaultPrice(level: GceLevel, type: DocumentType, paper: string): number {
  if (type === "QUESTIONS") return questionsOnlyPrice(level, paper || null);
  return schemeOnlyPrice(level);
}

export function DocumentsManager() {
  const [documents, setDocuments] = useState<DbDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [level, setLevel] = useState<GceLevel>("O_LEVEL");
  const [year, setYear] = useState(2026);
  const [subject, setSubject] = useState("");
  const [paper, setPaper] = useState("");
  const [type, setType] = useState<DocumentType>("QUESTIONS");
  const [price, setPrice] = useState(defaultPrice("O_LEVEL", "QUESTIONS", ""));
  const [file, setFile] = useState<File | null>(null);
  const [priceTouched, setPriceTouched] = useState(false);

  useEffect(() => {
    if (!priceTouched) setPrice(defaultPrice(level, type, paper));
  }, [level, type, paper, priceTouched]);

  async function refresh() {
    setLoading(true);
    const res = await fetch("/api/admin/documents");
    const data = await res.json();
    setDocuments(data.documents ?? []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setSubmitting(true);

    const form = new FormData();
    form.set("level", level);
    form.set("year", String(year));
    form.set("subject", joinPaperLabel(subject.trim(), paper));
    form.set("type", type);
    form.set("price", String(price));
    form.set("file", file);

    try {
      const res = await fetch("/api/admin/documents", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setFile(null);
      setPriceTouched(false);
      (document.getElementById("file-input") as HTMLInputElement | null)?.value &&
        ((document.getElementById("file-input") as HTMLInputElement).value = "");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function updatePrice(id: string, newPrice: number) {
    await fetch(`/api/admin/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price_fcfa: newPrice }),
    });
    refresh();
  }

  async function deleteDocument(id: string) {
    if (!confirm("Delete this document permanently?")) return;
    await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-lg border border-white/10 bg-[#14151b] p-5">
        <h2 className="text-sm font-semibold text-white">Add a document</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs text-white/50">
            Level
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as GceLevel)}
              className="rounded border border-white/15 bg-white/5 px-2 py-2 text-sm text-white"
            >
              <option value="O_LEVEL">O Level</option>
              <option value="A_LEVEL">A Level</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-white/50">
            Year
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded border border-white/15 bg-white/5 px-2 py-2 text-sm text-white"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-white/50">
            Type
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DocumentType)}
              className="rounded border border-white/15 bg-white/5 px-2 py-2 text-sm text-white"
            >
              <option value="QUESTIONS">Questions</option>
              <option value="MARKING_SCHEME">Marking Scheme</option>
            </select>
          </label>

          <label className="col-span-2 flex flex-col gap-1 text-xs text-white/50 sm:col-span-1">
            Subject
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Mathematics"
              required
              className="rounded border border-white/15 bg-white/5 px-2 py-2 text-sm text-white"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-white/50">
            Paper (optional)
            <input
              value={paper}
              onChange={(e) => setPaper(e.target.value)}
              placeholder="e.g. Paper 1 (MCQ)"
              className="rounded border border-white/15 bg-white/5 px-2 py-2 text-sm text-white"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-white/50">
            Price (FCFA)
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => {
                setPrice(Number(e.target.value));
                setPriceTouched(true);
              }}
              required
              className="rounded border border-white/15 bg-white/5 px-2 py-2 text-sm text-white"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-white/50">
            PDF file
            <input
              id="file-input"
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              className="rounded border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-white file:mr-2 file:rounded file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-white"
            />
          </label>

          <div className="col-span-2 flex items-end sm:col-span-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
            >
              {submitting ? "Uploading…" : "Add document"}
            </button>
          </div>
        </form>
        <p className="mt-2 text-xs text-white/40">
          Leave &quot;Paper&quot; blank for a subject with one paper. If a subject has
          multiple papers (e.g. Economics Paper 1, 2, 3), upload each one separately
          with the same Subject and a different Paper label — they&apos;ll show up
          grouped together for students.
        </p>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-white">All documents</h2>
        {loading ? (
          <p className="mt-3 text-sm text-white/50">Loading…</p>
        ) : documents.length === 0 ? (
          <p className="mt-3 text-sm text-white/50">No documents uploaded yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/50">
                <tr>
                  <th className="px-3 py-2 font-medium">Level</th>
                  <th className="px-3 py-2 font-medium">Year</th>
                  <th className="px-3 py-2 font-medium">Subject</th>
                  <th className="px-3 py-2 font-medium">Paper</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Price</th>
                  <th className="px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const { subject, paper } = splitPaperLabel(doc.subject);
                  return (
                  <tr key={doc.id} className="border-t border-white/10">
                    <td className="px-3 py-2 text-white">{doc.level === "O_LEVEL" ? "O Level" : "A Level"}</td>
                    <td className="px-3 py-2 text-white">{doc.year}</td>
                    <td className="px-3 py-2 text-white">{subject}</td>
                    <td className="px-3 py-2 text-white/60">{paper ?? "—"}</td>
                    <td className="px-3 py-2 text-white/70">
                      {doc.type === "QUESTIONS" ? "Questions" : "Marking Scheme"}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        defaultValue={doc.price_fcfa}
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (v !== doc.price_fcfa) updatePrice(doc.id, v);
                        }}
                        className="w-20 rounded border border-white/15 bg-white/5 px-2 py-1 text-white"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
