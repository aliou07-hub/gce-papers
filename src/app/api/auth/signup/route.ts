import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/auth/phone";
import { hashPassword } from "@/lib/auth/password";
import { createStudentSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const bodySchema = z.object({
  phone: z.string().min(1),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json(
      { error: "Enter a valid Cameroon phone number, e.g. 6XXXXXXXX" },
      { status: 400 }
    );
  }

  // Caps how many accounts one device can spin up per window — stops scripted mass signups.
  const ip = getClientIp(request);
  if (!checkRateLimit(`signup:ip:${ip}`, 10, 30 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many accounts created from this connection. Try again later." },
      { status: 429 }
    );
  }

  const supabase = supabaseAdmin();

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("phone_number", phone)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "An account with this phone number already exists" },
      { status: 409 }
    );
  }

  const password_hash = await hashPassword(parsed.data.password);

  const { data: user, error } = await supabase
    .from("users")
    .insert({ phone_number: phone, password_hash })
    .select("id, phone_number")
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "Could not create account" }, { status: 500 });
  }

  await createStudentSession(user);

  return NextResponse.json({ ok: true });
}
