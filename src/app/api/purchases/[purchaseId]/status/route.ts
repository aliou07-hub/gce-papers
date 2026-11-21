import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { reconcilePurchase } from "@/lib/payment/reconcile";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Polled by the checkout page while the student approves the payment on
 * their phone. Only the student who owns the purchase can poll it.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { purchaseId } = await params;
  const { data: purchase } = await supabaseAdmin()
    .from("purchases")
    .select("id, user_id, payment_status, payment_reference, amount_paid_fcfa")
    .eq("id", purchaseId)
    .maybeSingle();

  if (!purchase || purchase.user_id !== session.sub) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ status: await reconcilePurchase(purchase) });
}
