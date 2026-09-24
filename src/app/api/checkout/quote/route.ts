import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { checkoutQuerySchema, resolveCheckoutQuote } from "@/lib/checkoutQuote";

export async function GET(request: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const url = new URL(request.url);
  const parsed = checkoutQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 });
  }

  const quote = await resolveCheckoutQuote(parsed.data);
  if (!quote) {
    return NextResponse.json({ error: "This item is not available" }, { status: 404 });
  }

  return NextResponse.json({ label: quote.label, amountFcfa: quote.amountFcfa });
}
