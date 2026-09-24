import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/auth/phone";
import { verifyPassword } from "@/lib/auth/password";
import { createStudentSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import type { DbUser } from "@/lib/types";

const bodySchema = z.object({
  phone: z.string().min(1),
  password: z.string().min(1),
});

const TOO_MANY = NextResponse.json(
  { error: "Too many attempts. Wait a few minutes and try again." },
  { status: 429 }
);

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
  }

  const ip = getClientIp(request);
  // Per-account lock (survives IP changes) and a looser per-IP cap (slows down account enumeration).
  if (
    !checkRateLimit(`login:acct:${phone}`, 6, 10 * 60 * 1000) ||
    !checkRateLimit(`login:ip:${ip}`, 30, 10 * 60 * 1000)
  ) {
    return TOO_MANY;
  }

  const supabase = supabaseAdmin();
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("phone_number", phone)
    .maybeSingle<DbUser>();

  if (!user || !(await verifyPassword(parsed.data.password, user.password_hash))) {
    return NextResponse.json({ error: "Incorrect phone number or password" }, { status: 401 });
  }

  await createStudentSession(user);

  return NextResponse.json({ ok: true });
}
