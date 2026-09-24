import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { DbPurchase } from "@/lib/types";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("purchases")
    .select("*")
    .eq("payment_status", "confirmed")
    .order("created_at", { ascending: false });

  const purchases = (data as DbPurchase[] | null) ?? [];

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const within = (days: number) =>
    purchases.filter((p) => now - new Date(p.created_at).getTime() <= days * DAY);

  const summarize = (rows: DbPurchase[]) => ({
    count: rows.length,
    revenueFcfa: rows.reduce((sum, r) => sum + r.amount_paid_fcfa, 0),
  });

  return NextResponse.json({
    today: summarize(within(1)),
    last7Days: summarize(within(7)),
    last30Days: summarize(within(30)),
    allTime: summarize(purchases),
    recent: purchases.slice(0, 20),
  });
}
