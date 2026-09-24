import Link from "next/link";
import { AppHeader } from "@/components/app/AppHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { getStudentSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/server";
import { splitPaperLabel } from "@/lib/paperLabel";
import type { DbDocument, DbPurchase, GceLevel } from "@/lib/types";

export const metadata = { title: "My Purchases — GCE Papers" };

const LEVEL_LABEL: Record<GceLevel, string> = { O_LEVEL: "O Level", A_LEVEL: "A Level" };

export default async function PurchasesPage() {
  const session = await getStudentSession();
  if (!session) return null; // middleware guards this route

  const supabase = supabaseAdmin();
  const { data: purchases } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", session.sub)
    .eq("payment_status", "confirmed")
    .order("created_at", { ascending: false });

  const docIds = new Set<string>();
  for (const p of (purchases as DbPurchase[] | null) ?? []) {
    if (p.document_id) docIds.add(p.document_id);
    if (p.second_document_id) docIds.add(p.second_document_id);
  }
  const { data: docs } = docIds.size
    ? await supabase.from("documents").select("*").in("id", Array.from(docIds))
    : { data: [] as DbDocument[] };
  const docById = new Map((docs as DbDocument[]).map((d) => [d.id, d]));

  const list = (purchases as DbPurchase[] | null) ?? [];

  return (
    <>
      <AppHeader />
      <main className="flex-1 px-5 pb-16 pt-6">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-2xl font-bold text-ink">My Purchases</h1>
          <p className="mt-1 text-sm text-ink-dim">
            Everything you&apos;ve unlocked, available offline in the viewer.
          </p>

          {list.length === 0 && (
            <GlassPanel className="mt-6 p-6 text-center">
              <p className="text-ink-dim">You haven&apos;t bought anything yet.</p>
              <Link href="/level" className="mt-4 inline-block">
                <Button>Browse past papers</Button>
              </Link>
            </GlassPanel>
          )}

          <div className="mt-6 flex flex-col gap-3">
            {list.map((purchase) => {
              const isBundle = !!purchase.bundle_level;
              const questions = purchase.document_id ? docById.get(purchase.document_id) : null;
              const scheme = purchase.second_document_id
                ? docById.get(purchase.second_document_id)
                : null;

              return (
                <GlassPanel key={purchase.id} className="p-4">
                  <p className="font-semibold text-ink">
                    {isBundle
                      ? `${LEVEL_LABEL[purchase.bundle_level!]} ${purchase.bundle_year} — Full year`
                      : (() => {
                          const { subject, paper } = splitPaperLabel(purchase.subject ?? "");
                          return paper ? `${subject}, ${paper}` : subject;
                        })()}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {new Date(purchase.created_at).toLocaleDateString()} ·{" "}
                    {purchase.amount_paid_fcfa.toLocaleString()} FCFA
                  </p>

                  {isBundle ? (
                    <Link href={`/level/${purchase.bundle_level}/year/${purchase.bundle_year}`}>
                      <Button variant="ghost" className="mt-3 w-full text-[13px]">
                        Open subjects
                      </Button>
                    </Link>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      {questions && (
                        <Link href={`/viewer/${questions.id}`} className="flex-1">
                          <Button variant="ghost" className="w-full text-[13px]">
                            Questions
                          </Button>
                        </Link>
                      )}
                      {scheme && (
                        <Link href={`/viewer/${scheme.id}`} className="flex-1">
                          <Button variant="ghost" className="w-full text-[13px]">
                            Marking scheme
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </GlassPanel>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
