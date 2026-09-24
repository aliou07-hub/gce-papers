import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app/AppHeader";
import { ProgressTrail } from "@/components/app/ProgressTrail";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { getSubjectOfferings, getBundleQuote } from "@/lib/subjects";
import { joinPaperLabel } from "@/lib/paperLabel";
import { questionsOnlyPrice, questionsAndSchemePrice, schemeOnlyPrice } from "@/lib/pricing";
import { getStudentSession } from "@/lib/auth/session";
import { userCanAccessDocument } from "@/lib/access";
import type { GceLevel } from "@/lib/types";

const LEVEL_LABEL: Record<GceLevel, string> = { O_LEVEL: "O Level", A_LEVEL: "A Level" };

export default async function SubjectsPage({
  params,
}: {
  params: Promise<{ level: string; year: string }>;
}) {
  const { level, year: yearParam } = await params;
  if (level !== "O_LEVEL" && level !== "A_LEVEL") notFound();
  const year = Number(yearParam);
  if (!Number.isInteger(year)) notFound();

  const session = await getStudentSession();
  const [offerings, bundle] = await Promise.all([
    getSubjectOfferings(level, year),
    getBundleQuote(level, year),
  ]);

  const offeringsWithAccess = await Promise.all(
    offerings.map(async (offering) => ({
      ...offering,
      papers: await Promise.all(
        offering.papers.map(async (paper) => ({
          ...paper,
          questionsUnlocked:
            session && paper.questions
              ? await userCanAccessDocument(session.sub, paper.questions)
              : false,
          schemeUnlocked:
            session && paper.markingScheme
              ? await userCanAccessDocument(session.sub, paper.markingScheme)
              : false,
        }))
      ),
    }))
  );

  const bundleFullyOwned = offeringsWithAccess.every((o) =>
    o.papers.every(
      (p) => (!p.questions || p.questionsUnlocked) && (!p.markingScheme || p.schemeUnlocked)
    )
  );

  return (
    <>
      <AppHeader />
      <main className="flex-1 px-5 pb-24 pt-6">
        <div className="mx-auto w-full max-w-sm">
          <ProgressTrail current={2} />
          <h1 className="mt-5 text-2xl font-bold text-ink">
            {LEVEL_LABEL[level]} {year}
          </h1>
          <p className="mt-1 text-sm text-ink-dim">
            {offerings.length === 0
              ? "No subjects uploaded yet for this year."
              : "Pick a subject, then choose questions only or questions with marking scheme."}
          </p>

          {bundle.subjectCount > 1 && !bundleFullyOwned && (
            <GlassPanel className="glass-mint mt-5 flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-semibold text-ink">Buy the full year</p>
                <p className="mt-0.5 text-xs text-ink-dim">
                  All {bundle.subjectCount} papers, questions + marking schemes
                </p>
              </div>
              <Link
                href={`/checkout?type=bundle&level=${level}&year=${year}`}
                className="shrink-0"
              >
                <Button variant="primary" tint="var(--color-mint)">
                  {bundle.price.toLocaleString()} FCFA
                </Button>
              </Link>
            </GlassPanel>
          )}

          <div className="mt-5 flex flex-col gap-3">
            {offeringsWithAccess.map((offering) => (
              <GlassPanel key={offering.subject} className="p-4">
                <p className="font-semibold text-ink">{offering.subject}</p>
                <div className="mt-3 flex flex-col gap-2.5">
                  {offering.papers.map((paper) => {
                    const rawSubject = joinPaperLabel(offering.subject, paper.label);
                    const questionsPrice = questionsOnlyPrice(level, paper.label);
                    const bothPrice = questionsAndSchemePrice(level, paper.label);
                    return (
                      <div key={paper.label ?? ""}>
                        {paper.label && (
                          <p className="mb-1.5 text-xs font-medium text-ink-faint">
                            {paper.label}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {paper.questions &&
                            (paper.questionsUnlocked ? (
                              <Link href={`/viewer/${paper.questions.id}`} className="flex-1">
                                <Button variant="ghost" className="w-full text-[13px]">
                                  Open questions
                                </Button>
                              </Link>
                            ) : (
                              <>
                                <Link href={`/viewer/${paper.questions.id}`}>
                                  <Button variant="ghost" className="text-[13px]">
                                    Preview
                                  </Button>
                                </Link>
                                <Link
                                  href={`/checkout?type=subject&level=${level}&year=${year}&subject=${encodeURIComponent(
                                    rawSubject
                                  )}&option=questions`}
                                  className="flex-1"
                                >
                                  <Button variant="ghost" className="w-full text-[13px]">
                                    Questions · {questionsPrice} FCFA
                                  </Button>
                                </Link>
                              </>
                            ))}
                          {!paper.questions && paper.markingScheme && (
                            <>
                              {paper.schemeUnlocked ? (
                                <Link href={`/viewer/${paper.markingScheme.id}`} className="flex-1">
                                  <Button
                                    variant={level === "O_LEVEL" ? "o-level" : "a-level"}
                                    className="w-full text-[13px]"
                                  >
                                    Open marking scheme
                                  </Button>
                                </Link>
                              ) : (
                                <>
                                  <Link href={`/viewer/${paper.markingScheme.id}`}>
                                    <Button variant="ghost" className="text-[13px]">
                                      Preview
                                    </Button>
                                  </Link>
                                  <Link
                                    href={`/checkout?type=subject&level=${level}&year=${year}&subject=${encodeURIComponent(
                                      rawSubject
                                    )}&option=scheme`}
                                    className="flex-1"
                                  >
                                    <Button
                                      variant={level === "O_LEVEL" ? "o-level" : "a-level"}
                                      className="w-full text-[13px]"
                                    >
                                      Marking scheme · {schemeOnlyPrice(level)} FCFA
                                    </Button>
                                  </Link>
                                </>
                              )}
                            </>
                          )}
                          {paper.questions && paper.markingScheme && (
                            <>
                              {paper.schemeUnlocked ? (
                                <Link
                                  href={`/viewer/${paper.markingScheme.id}`}
                                  className="flex-1"
                                >
                                  <Button
                                    variant={level === "O_LEVEL" ? "o-level" : "a-level"}
                                    className="w-full text-[13px]"
                                  >
                                    Open marking scheme
                                  </Button>
                                </Link>
                              ) : (
                                <Link
                                  href={`/checkout?type=subject&level=${level}&year=${year}&subject=${encodeURIComponent(
                                    rawSubject
                                  )}&option=both`}
                                  className="flex-1"
                                >
                                  <Button
                                    variant={level === "O_LEVEL" ? "o-level" : "a-level"}
                                    className="w-full text-[13px]"
                                  >
                                    + Marking · {bothPrice} FCFA
                                  </Button>
                                </Link>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
