import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getPaymentProvider } from "./index";

export type PurchaseStatus = "pending" | "confirmed" | "failed";

interface PendingPurchase {
  id: string;
  payment_status: string;
  payment_reference: string | null;
  amount_paid_fcfa: number;
}

/**
 * Makes sure a paid purchase is always delivered. The signed KPAY webhook is
 * the normal path; this is the safety net: for a purchase still "pending", ask
 * KPAY directly (server-to-server, authenticated with our secret key) and
 * unlock it if KPAY says the payment COMPLETED for this exact purchase and
 * amount. Safe to call repeatedly.
 */
export async function reconcilePurchase(purchase: PendingPurchase): Promise<PurchaseStatus> {
  if (purchase.payment_status !== "pending" || !purchase.payment_reference) {
    return purchase.payment_status as PurchaseStatus;
  }

  try {
    const remote = await getPaymentProvider().getStatus(purchase.payment_reference);
    if (!remote || remote.externalId !== purchase.id) return "pending";

    const supabase = supabaseAdmin();
    if (remote.status === "COMPLETED") {
      if (remote.amount < purchase.amount_paid_fcfa) {
        console.error("[kpay] amount below purchase price", purchase.id, remote.amount);
        return "pending";
      }
      await supabase
        .from("purchases")
        .update({ payment_status: "confirmed", confirmed_at: new Date().toISOString() })
        .eq("id", purchase.id)
        .eq("payment_status", "pending");
      return "confirmed";
    }
    if (remote.status === "FAILED") {
      await supabase
        .from("purchases")
        .update({ payment_status: "failed" })
        .eq("id", purchase.id)
        .eq("payment_status", "pending");
      return "failed";
    }
  } catch (e) {
    console.error("[kpay] status check failed", purchase.id, e);
  }
  return "pending";
}

/** Reconciles every recent pending purchase of one student (used by My Purchases). */
export async function reconcileUserPurchases(userId: string): Promise<number> {
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data } = await supabaseAdmin()
    .from("purchases")
    .select("id, payment_status, payment_reference, amount_paid_fcfa")
    .eq("user_id", userId)
    .eq("payment_status", "pending")
    .not("payment_reference", "is", null)
    .gte("created_at", since)
    .limit(10);
  const results = await Promise.all((data ?? []).map(reconcilePurchase));
  return results.filter((s) => s === "pending").length;
}
