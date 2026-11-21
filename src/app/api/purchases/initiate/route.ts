import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { checkoutQuerySchema, resolveCheckoutQuote } from "@/lib/checkoutQuote";
import { getPaymentProvider } from "@/lib/payment";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  // Signed-in already, so this just stops one account from spamming purchase rows.
  if (!checkRateLimit(`purchase:user:${session.sub}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Wait a moment and try again." }, { status: 429 });
  }

  const parsed = checkoutQuerySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const quote = await resolveCheckoutQuote(parsed.data);
  if (!quote) {
    return NextResponse.json({ error: "This item is not available" }, { status: 404 });
  }

  const supabase = supabaseAdmin();

  const { data: purchase, error: insertError } = await supabase
    .from("purchases")
    .insert({
      user_id: session.sub,
      document_id: quote.documentId ?? null,
      second_document_id: quote.secondDocumentId ?? null,
      bundle_level: parsed.data.type === "bundle" ? parsed.data.level : null,
      bundle_year: parsed.data.type === "bundle" ? parsed.data.year : null,
      subject: parsed.data.type === "subject" ? parsed.data.subject : null,
      amount_paid_fcfa: quote.amountFcfa,
      payment_status: "pending",
      // The customer enters their Mobile Money number on the payment page, not here.
      momo_number: "gateway",
    })
    .select("id")
    .single();

  if (insertError || !purchase) {
    return NextResponse.json({ error: "Could not start purchase" }, { status: 500 });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
  try {
    const provider = getPaymentProvider();
    const result = await provider.initiate({
      amountFcfa: quote.amountFcfa,
      purchaseId: purchase.id,
      siteUrl,
    });

    await supabase
      .from("purchases")
      .update({
        payment_status: result.confirmed ? "confirmed" : "pending",
        payment_reference: result.reference,
        confirmed_at: result.confirmed ? new Date().toISOString() : null,
      })
      .eq("id", purchase.id);

    return NextResponse.json({
      purchaseId: purchase.id,
      confirmed: result.confirmed,
      redirectUrl: result.redirectUrl ?? null,
      label: quote.label,
      amountFcfa: quote.amountFcfa,
    });
  } catch {
    await supabase.from("purchases").update({ payment_status: "failed" }).eq("id", purchase.id);
    return NextResponse.json({ error: "Payment could not be completed" }, { status: 502 });
  }
}
