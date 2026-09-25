import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { HeroPaperStack } from "@/components/app/HeroPaperStack";

export const dynamic = "force-dynamic";

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
            <span className="flex items-center gap-2 text-[15px] font-bold">
              <Image src="/branding/icon.png" alt="" width={26} height={26} className="h-[26px] w-[26px]" />
              GCE Papers
            </span>
            <Link href="/login" className="text-sm text-white/70">
              Log in
            </Link>
          </div>

          <div className="grid grid-cols-1 items-center gap-10 pb-16 pt-8 md:grid-cols-[1.05fr_0.95fr] md:gap-6 md:pt-14">
            <div className="max-w-md">
              <h1 className="text-[2.3rem] font-bold leading-[1.12] tracking-[-0.01em] md:text-[2.75rem]">
                Every past paper the GCE Board has set — right here.
              </h1>
              <p className="mt-5 text-[15px] leading-relaxed text-white/75">
                {stats.total} Ordinary and Advanced Level papers across {stats.subjects} subjects,
                {" "}
                {stats.minYear} to {stats.maxYear}, with marking schemes — priced so every student
                in Cameroon can actually afford to use it.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className="sm:flex-1">
                  <Button className="w-full">Get started</Button>
                </Link>
                <Link href="/login" className="sm:flex-1">
                  <Button variant="ghost" className="btn-ghost-dark w-full">
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
        <div className="mx-auto w-full max-w-sm">
          <GlassPanel className="p-5">
            <p className="text-sm leading-relaxed text-ink-dim">
              <span className="font-semibold text-ink">Papers stay on GCE Papers.</span> No
              files to lose and no links to pass around — read them in the built-in viewer, and
              what you buy keeps working even when your data doesn&apos;t.
            </p>
          </GlassPanel>

          <GlassPanel className="mt-4 p-5">
            <p className="text-sm leading-relaxed text-ink-dim">
              <span className="font-semibold text-ink">Preview before you pay.</span> Open any
              paper and read the first couple of pages free — buy only once you know it&apos;s the
              right one.
            </p>
          </GlassPanel>
        </div>
      </main>
    </>
  );
}
