import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { documentId } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.price_fcfa !== "number") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("documents")
    .update({ price_fcfa: body.price_fcfa })
    .eq("id", documentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { documentId } = await params;
  const supabase = supabaseAdmin();

  const { data: document } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", documentId)
    .maybeSingle();

  await supabase.from("documents").delete().eq("id", documentId);
  if (document?.file_path) {
    await supabase.storage.from("documents").remove([document.file_path]);
  }

  return NextResponse.json({ ok: true });
}
