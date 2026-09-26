import "server-only";
import { z } from "zod";
import { supabaseAdmin } from "./supabase/server";
import { getBundleQuote } from "./subjects";
import { splitPaperLabel } from "./paperLabel";
import type { DbDocument, GceLevel } from "./types";

export const checkoutQuerySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("subject"),
    level: z.enum(["O_LEVEL", "A_LEVEL"]),
    year: z.coerce.number().int(),
    subject: z.string().min(1),
    option: z.enum(["questions", "both", "scheme"]),
  }),
  z.object({
    type: z.literal("bundle"),
    level: z.enum(["O_LEVEL", "A_LEVEL"]),
    year: z.coerce.number().int(),
  }),
]);

export type CheckoutQuery = z.infer<typeof checkoutQuerySchema>;

export interface CheckoutQuote {
  label: string;
  amountFcfa: number;
  /** Resolved once we know the actual rows this purchase will cover. */
  documentId?: string;
  secondDocumentId?: string;
}

export async function resolveCheckoutQuote(query: CheckoutQuery): Promise<CheckoutQuote | null> {
  const supabase = supabaseAdmin();

  if (query.type === "bundle") {
    const { subjectCount, price } = await getBundleQuote(query.level, query.year);
    if (subjectCount === 0) return null;
    return {
      label: `${LEVEL_LABEL[query.level]} ${query.year} — full year (${subjectCount} subjects)`,
      amountFcfa: price,
    };
  }

  const { data: docs } = await supabase
    .from("documents")
    .select("*")
    .eq("level", query.level)
    .eq("year", query.year)
    .eq("subject", query.subject);

  const questions = (docs as DbDocument[] | null)?.find((d) => d.type === "QUESTIONS");
  const scheme = (docs as DbDocument[] | null)?.find((d) => d.type === "MARKING_SCHEME");

  const { subject, paper } = splitPaperLabel(query.subject);
  const subjectLabel = paper ? `${subject}, ${paper}` : subject;

  // Marking scheme sold on its own (no matching questions doc uploaded for this paper).
  if (query.option === "scheme") {
    if (!scheme) return null;
    return {
      label: `${subjectLabel} — ${LEVEL_LABEL[query.level]} ${query.year} (Marking Scheme)`,
      amountFcfa: scheme.price_fcfa,
      documentId: scheme.id,
    };
  }

  if (!questions) return null;
  if (query.option === "both" && !scheme) return null;

  // Real per-document prices (set by the admin), never re-derived from the
  // flat pricing formula — what's shown to the student is exactly what they
  // pay, even after a manual price edit in the admin dashboard.
  const amountFcfa =
    query.option === "both" ? questions.price_fcfa + (scheme?.price_fcfa ?? 0) : questions.price_fcfa;

  return {
    label: `${subjectLabel} — ${LEVEL_LABEL[query.level]} ${query.year} (${
      query.option === "both" ? "Questions + Marking Scheme" : "Questions only"
    })`,
    amountFcfa,
    documentId: questions.id,
    secondDocumentId: query.option === "both" ? scheme?.id : undefined,
  };
}

const LEVEL_LABEL: Record<GceLevel, string> = { O_LEVEL: "O Level", A_LEVEL: "A Level" };
