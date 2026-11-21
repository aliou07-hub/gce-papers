import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { HeroPaperStack } from "@/components/app/HeroPaperStack";

export const dynamic = "force-dynamic";

const STEPS = [
  { title: "Create your account", text: "Just your phone number and a password." },
  { title: "Choose your paper", text: "Pick O Level or A Level, the year, then the subject." },
  { title: "Pay with Mobile Money", text: "MTN MoMo or Orange Money. The paper opens right away." },
];

async function getCatalogStats() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("documents").select("subject, year");
  if (error) {
    console.error("[homepage] Supabase query failed:", error.message, error);
  }
  const rows = data ?? [];
  const subjects = new Set(rows.map((r) => String(r.subject).split(" — ")[0]));
  const years = rows.map((r) => r.year as number);
  return {
    total: rows.length,
    subjects: subjects.size,
    minYear: years.length ? Math.min(...years) : 2021,
    maxYear: years.length ? Math.max(...years) : new Date().getFullYear(),
  };
}

export default async function Home() {
  const session = await getStudentSession();
  if (session) redirect("/level");

  const stats = await getCatalogStats();

  return (
    <>
      <section className="landing-hero">
        <div className="mx-auto flex w-full max-w-5xl flex-col px-5 pt-5">
          <div className="flex items-center justify-between py-3">
            <span className="flex items-center gap-2 text-[15px] font-bold text-ink">
              <Image src="/branding/icon.png" alt="" width={26} height={26} className="h-[26px] w-[26px]" />
              GCE Papers
            </span>
            <Link
              href="/login"
              className="rounded-full border border-glass-border bg-white px-4 py-2 text-sm font-semibold text-ink"
            >
              Log in
            </Link>
          </div>

          <div className="grid grid-cols-1 items-center gap-8 pb-12 pt-6 md:grid-cols-[1.05fr_0.95fr] md:gap-6 md:pt-12">
            <div className="max-w-md">
              <h1 className="text-[2.1rem] font-bold leading-[1.12] tracking-[-0.01em] text-ink md:text-[2.75rem]">
                Every GCE past paper, with marking schemes.
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-dim">
                {stats.total} Ordinary and Advanced Level papers across {stats.subjects} subjects,
                from {stats.minYear} to {stats.maxYear}. Cheap enough for every student in
                Cameroon.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className="sm:flex-1">
                  <Button className="w-full py-3.5 text-base">Create a free account</Button>
                </Link>
                <Link href="/login" className="sm:flex-1">
                  <Button variant="ghost" className="w-full py-3.5 text-base">
                    I already have an account
                  </Button>
                </Link>
              </div>
            </div>

            <HeroPaperStack />
          </div>
        </div>
      </section>

      <main className="flex-1 px-5 pb-16 pt-10">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="text-xl font-bold text-ink">How it works</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <GlassPanel key={s.title} className="flex gap-4 p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-a text-base font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-ink">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-dim">{s.text}</p>
                </div>
              </GlassPanel>
            ))}
          </div>

          <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2">
            <GlassPanel className="p-5">
              <p className="text-sm leading-relaxed text-ink-dim">
                <span className="font-semibold text-ink">Preview before you pay.</span> Open any
                paper and read the first pages free. Buy only once you know it&apos;s the right
                one.
              </p>
            </GlassPanel>
            <GlassPanel className="p-5">
              <p className="text-sm leading-relaxed text-ink-dim">
                <span className="font-semibold text-ink">Everything stays in your account.</span>{" "}
                What you buy is always in &ldquo;My Purchases&rdquo;, ready to read in the
                built-in viewer.
              </p>
            </GlassPanel>
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="/signup" className="w-full max-w-sm">
              <Button className="w-full py-3.5 text-base">Get started</Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
