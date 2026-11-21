import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { getPaymentProvider } from "@/lib/payment";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Polled by the checkout page while the student approves the payment on
 * their phone. The signed KPAY webhook normally confirms the purchase; if it
 * hasn't arrived yet, we ask KPAY directly (server-to-server, with our secret
 * key) so the student isn't left waiting. Only the student who owns the
 * purchase can poll it.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { purchaseId } = await params;
  const supabase = supabaseAdmin();
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, user_id, payment_status, payment_reference, amount_paid_fcfa")
    .eq("id", purchaseId)
    .maybeSingle();

  if (!purchase || purchase.user_id !== session.sub) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (purchase.payment_status !== "pending" || !purchase.payment_reference) {
    return NextResponse.json({ status: purchase.payment_status });
  }

  try {
    const remote = await getPaymentProvider().getStatus(purchase.payment_reference);
    if (remote?.status === "COMPLETED" && remote.externalId === purchase.id) {
      if (remote.amount >= purchase.amount_paid_fcfa) {
        await supabase
          .from("purchases")
          .update({ payment_status: "confirmed", confirmed_at: new Date().toISOString() })
          .eq("id", purchase.id)
          .eq("payment_status", "pending");
        return NextResponse.json({ status: "confirmed" });
      }
      console.error("[kpay] amount below purchase price", purchase.id, remote.amount);
    } else if (remote?.status === "FAILED" && remote.externalId === purchase.id) {
      await supabase
        .from("purchases")
        .update({ payment_status: "failed" })
        .eq("id", purchase.id)
        .eq("payment_status", "pending");
      return NextResponse.json({ status: "failed" });
    }
  } catch (e) {
    console.error("[kpay] status check failed", e);
  }

  return NextResponse.json({ status: "pending" });
}
