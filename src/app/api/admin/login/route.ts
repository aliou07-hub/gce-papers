import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth/password";
import { createAdminSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import type { DbAdmin } from "@/lib/types";

const bodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Admin is the highest-value target (upload/pricing control) and its password is short,
  // so this is deliberately tighter than the student login limit.
  const ip = getClientIp(request);
  if (
    !checkRateLimit(`admin-login:acct:${parsed.data.username}`, 5, 15 * 60 * 1000) ||
    !checkRateLimit(`admin-login:ip:${ip}`, 5, 15 * 60 * 1000)
  ) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const supabase = supabaseAdmin();
  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("username", parsed.data.username)
    .maybeSingle<DbAdmin>();

  if (!admin || !(await verifyPassword(parsed.data.password, admin.password_hash))) {
    return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
  }

  await createAdminSession(admin);
  return NextResponse.json({ ok: true });
}
