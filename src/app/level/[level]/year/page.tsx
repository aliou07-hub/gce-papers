import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app/AppHeader";
import { ProgressTrail } from "@/components/app/ProgressTrail";
import type { GceLevel } from "@/lib/types";

export const metadata = { title: "Choose a year — GCE Papers" };

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021];
const LEVEL_LABEL: Record<GceLevel, string> = { O_LEVEL: "O Level", A_LEVEL: "A Level" };

export default async function YearPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  if (level !== "O_LEVEL" && level !== "A_LEVEL") notFound();

  return (
    <>
      <AppHeader />
      <main className="flex-1 px-5 pb-16 pt-6">
        <div className="mx-auto w-full max-w-sm">
          <ProgressTrail current={1} />
          <h1 className="mt-5 text-2xl font-bold text-ink">
            {LEVEL_LABEL[level]} — which year?
          </h1>
          <p className="mt-1 text-sm text-ink-dim">Past papers from 2021 to 2026.</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {YEARS.map((year) => (
              <Link
                key={year}
                href={`/level/${level}/year/${year}`}
                className="glass glass-tilt flex flex-col items-start p-5"
              >
                <span className="text-2xl font-bold text-ink">{year}</span>
                <span className="mt-1 text-xs text-ink-faint">GCE session</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
