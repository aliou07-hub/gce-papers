import Link from "next/link";
import { AppHeader } from "@/components/app/AppHeader";
import { ProgressTrail } from "@/components/app/ProgressTrail";
import { TiltCard } from "@/components/ui/TiltCard";
import { BookIcon, CapIcon, TONES, IconBadge } from "@/components/ui/IconBadge";

export const metadata = { title: "Choose a level — GCE Papers" };

export default function LevelPage() {
  return (
    <>
      <AppHeader />
      <main className="flex-1 px-5 pb-16 pt-6">
        <div className="mx-auto w-full max-w-sm">
          <ProgressTrail current={0} />
          <h1 className="mt-5 text-2xl font-bold text-ink">Which level?</h1>
          <p className="mt-1 text-sm text-ink-dim">Pick the exam you&apos;re revising for.</p>

          <div className="mt-6 flex flex-col gap-4">
            <Link href="/level/O_LEVEL/year">
              <TiltCard className="flex items-center gap-4 p-6">
                <IconBadge tone={TONES.oLevel}>
                  <BookIcon />
                </IconBadge>
                <div>
                  <p className="text-xl font-bold text-accent-o">O Level</p>
                  <p className="mt-1 text-sm text-ink-dim">Ordinary Level, first cycle</p>
                </div>
              </TiltCard>
            </Link>

            <Link href="/level/A_LEVEL/year">
              <TiltCard className="flex items-center gap-4 p-6">
                <IconBadge tone={TONES.aLevel}>
                  <CapIcon />
                </IconBadge>
                <div>
                  <p className="text-xl font-bold text-accent-a-soft">A Level</p>
                  <p className="mt-1 text-sm text-ink-dim">Advanced Level, second cycle</p>
                </div>
              </TiltCard>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
