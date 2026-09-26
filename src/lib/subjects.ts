import "server-only";
import { supabaseAdmin } from "./supabase/server";
import type { DbDocument, GceLevel, SubjectOffering } from "./types";
import { bundlePrice } from "./pricing";
import { splitPaperLabel } from "./paperLabel";

export { splitPaperLabel, joinPaperLabel } from "./paperLabel";

export async function getSubjectOfferings(
  level: GceLevel,
  year: number
): Promise<SubjectOffering[]> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("level", level)
    .eq("year", year)
    .order("subject", { ascending: true });

  if (error || !data) return [];

  const bySubject = new Map<string, Map<string, { questions?: DbDocument; markingScheme?: DbDocument }>>();

  for (const doc of data as DbDocument[]) {
    const { subject, paper } = splitPaperLabel(doc.subject);
    const paperKey = paper ?? "";
    if (!bySubject.has(subject)) bySubject.set(subject, new Map());
    const papers = bySubject.get(subject)!;
    const entry = papers.get(paperKey) ?? {};
    if (doc.type === "QUESTIONS") entry.questions = doc;
    else entry.markingScheme = doc;
    papers.set(paperKey, entry);
  }

  return Array.from(bySubject.entries()).map(([subject, papers]) => ({
    subject,
    papers: Array.from(papers.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, docs]) => ({ label: label || null, ...docs })),
  }));
}

export async function getAvailableYears(level: GceLevel): Promise<number[]> {
  const supabase = supabaseAdmin();
  const { data } = await supabase.from("documents").select("year").eq("level", level);
  const years = new Set((data ?? []).map((r) => r.year as number));
  return Array.from(years).sort((a, b) => b - a);
}

/** Every purchasable paper (across every subject) counts as one unit for the
 * full-year bundle discount — a subject with 3 papers contributes 3 units. */
export async function getBundleQuote(level: GceLevel, year: number) {
  const offerings = await getSubjectOfferings(level, year);
  const eligiblePapers = offerings.flatMap((o) =>
    o.papers.filter((p) => p.questions && p.markingScheme)
  );
  // Real per-document prices, so the bundle total always matches what each
  // paper actually costs individually (including any admin price edits).
  const fullPrice = eligiblePapers.reduce(
    (sum, p) => sum + p.questions!.price_fcfa + p.markingScheme!.price_fcfa,
    0
  );
  return {
    subjectCount: eligiblePapers.length,
    price: bundlePrice(fullPrice),
  };
}
