import type { GceLevel } from "./types";

/** O-Level is flat per paper regardless of subject or paper number. */
const O_LEVEL_QUESTIONS_PRICE = 150;
const O_LEVEL_SCHEME_PRICE = 100;

/** A-Level: Paper 1 costs more than the other papers; marking schemes are
 * a flat price regardless of paper number. */
const A_LEVEL_PAPER_ONE_QUESTIONS_PRICE = 250;
const A_LEVEL_OTHER_PAPER_QUESTIONS_PRICE = 200;
const A_LEVEL_SCHEME_PRICE = 400;

/** Flat discount applied to a full-year bundle (questions + marking scheme for every paper). */
export const BUNDLE_DISCOUNT_FCFA = 400;

function paperNumber(paper: string | null): number | null {
  const match = paper?.match(/paper\s+(\d+)/i);
  return match ? Number(match[1]) : null;
}

/** `paper` is the raw label e.g. "Paper 1 (MCQ)", as split off the subject
 * by splitPaperLabel — pass null for a subject with a single, unlabeled paper. */
export function questionsOnlyPrice(level: GceLevel, paper: string | null = null): number {
  if (level === "O_LEVEL") return O_LEVEL_QUESTIONS_PRICE;
  return paperNumber(paper) === 1
    ? A_LEVEL_PAPER_ONE_QUESTIONS_PRICE
    : A_LEVEL_OTHER_PAPER_QUESTIONS_PRICE;
}

export function schemeOnlyPrice(level: GceLevel): number {
  return level === "O_LEVEL" ? O_LEVEL_SCHEME_PRICE : A_LEVEL_SCHEME_PRICE;
}

export function questionsAndSchemePrice(level: GceLevel, paper: string | null = null): number {
  return questionsOnlyPrice(level, paper) + schemeOnlyPrice(level);
}

/**
 * Full-year bundle price: every available paper at "questions + marking
 * scheme", summed at their real per-paper prices, minus the fixed discount.
 */
export function bundlePrice(fullPrice: number): number {
  return Math.max(0, fullPrice - BUNDLE_DISCOUNT_FCFA);
}
