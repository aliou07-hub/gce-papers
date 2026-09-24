const PAPER_SEPARATOR = " — ";

/** "Economics — Paper 1" -> { subject: "Economics", paper: "Paper 1" }. Plain
 * "Mathematics" -> { subject: "Mathematics", paper: null }. Client-safe (no
 * server-only imports) so both server pages and the admin upload form can use it. */
export function splitPaperLabel(rawSubject: string): { subject: string; paper: string | null } {
  const idx = rawSubject.indexOf(PAPER_SEPARATOR);
  if (idx === -1) return { subject: rawSubject, paper: null };
  return {
    subject: rawSubject.slice(0, idx),
    paper: rawSubject.slice(idx + PAPER_SEPARATOR.length),
  };
}

export function joinPaperLabel(subject: string, paper: string | null | undefined): string {
  const trimmedPaper = paper?.trim();
  return trimmedPaper ? `${subject}${PAPER_SEPARATOR}${trimmedPaper}` : subject;
}
