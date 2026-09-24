import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/server";

/** Storage object keys must be ASCII-safe. The human-readable subject (which
 * may contain an em dash, accents, etc. from the paper-label convention)
 * stays intact in the `subject` column — only the storage path is slugified. */
function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "untitled";
}

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .order("level", { ascending: true })
    .order("year", { ascending: false })
    .order("subject", { ascending: true });

  return NextResponse.json({ documents: data ?? [] });
}

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const form = await request.formData();
  const level = form.get("level");
  const year = form.get("year");
  const subject = form.get("subject");
  const type = form.get("type");
  const price = form.get("price");
  const file = form.get("file");

  if (
    (level !== "O_LEVEL" && level !== "A_LEVEL") ||
    typeof year !== "string" ||
    typeof subject !== "string" ||
    !subject.trim() ||
    (type !== "QUESTIONS" && type !== "MARKING_SCHEME") ||
    typeof price !== "string" ||
    !(file instanceof File)
  ) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const filePath = `${level}/${year}/${slugify(subject.trim())}/${type}-${randomUUID()}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, await file.arrayBuffer(), { contentType: "application/pdf" });

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed: " + uploadError.message }, { status: 500 });
  }

  const { data: document, error: insertError } = await supabase
    .from("documents")
    .insert({
      level,
      year: Number(year),
      subject: subject.trim(),
      type,
      file_path: filePath,
      price_fcfa: Number(price),
    })
    .select("*")
    .single();

  if (insertError) {
    await supabase.storage.from("documents").remove([filePath]);
    return NextResponse.json(
      { error: insertError.message.includes("duplicate") ? "This document already exists" : insertError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ document });
}
