import "server-only";
import { supabaseAdmin } from "./supabase/server";
import type { DbDocument, DbPurchase } from "./types";

/** Whether `userId` has confirmed, unlocked access to `document`. */
export async function userCanAccessDocument(
  userId: string,
  document: DbDocument
): Promise<boolean> {
  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("payment_status", "confirmed")
    .or(
      `document_id.eq.${document.id},second_document_id.eq.${document.id},and(bundle_level.eq.${document.level},bundle_year.eq.${document.year})`
    );

  return ((data as DbPurchase[] | null) ?? []).length > 0;
}
