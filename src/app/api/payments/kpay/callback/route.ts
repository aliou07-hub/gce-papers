import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validSignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"));
  const received = Buffer.from(header.trim().toLowerCase());
  return expected.length === received.length && timingSafeEqual(expected, received);
}

interface KpayEvent {
  event?: string;
  status?: string;
  externalId?: string;
  amount?: number | string;
}

export async function POST(request: Request) {
  const secret = process.env.KPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  // The signature covers the raw bytes, so read the body as text before parsing.
  const rawBody = await request.text();
  if (!validSignature(rawBody, request.headers.get("x-kpay-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: KpayEvent;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // 200 for anything we can't act on, so KPAY doesn't keep retrying it.
  if (typeof payload.externalId !== "string" || !UUID.test(payload.externalId)) {
    return NextResponse.json({ received: true });
  }

  const supabase = supabaseAdmin();
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, amount_paid_fcfa")
    .eq("id", payload.externalId)
    .maybeSingle();
  if (!purchase) return NextResponse.json({ received: true });

  if (payload.event === "payment.completed" && payload.status === "COMPLETED") {
    if (Number(payload.amount) < purchase.amount_paid_fcfa) {
      console.error("KPAY amount below purchase price", purchase.id, payload.amount);
      return NextResponse.json({ received: true });
    }
    // A signed COMPLETED event always delivers, even if our side had marked
    // the purchase failed (e.g. KPAY answered the init call too slowly).
    await supabase
      .from("purchases")
      .update({ payment_status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("id", purchase.id)
      .in("payment_status", ["pending", "failed"]);
  } else if (payload.event === "payment.failed" || payload.event === "payment.cancelled") {
    await supabase
      .from("purchases")
      .update({ payment_status: "failed" })
      .eq("id", purchase.id)
      .eq("payment_status", "pending");
  }

  return NextResponse.json({ received: true });
}
