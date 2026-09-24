import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", session.sub)
    .order("created_at", { ascending: false });

  return NextResponse.json({ purchases: data ?? [] });
}
