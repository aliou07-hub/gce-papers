import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { userCanAccessDocument } from "@/lib/access";
import { supabaseAdmin } from "@/lib/supabase/server";
import { previewPageCount, truncatePdf, getPdfPageCount } from "@/lib/pdfPreview";
import type { DbDocument } from "@/lib/types";

/**
 * Streams a document's PDF bytes to the authenticated in-app viewer only —
 * never a public/signed URL, so there is nothing shareable to leak.
 *
 * If the signed-in student hasn't purchased this document, only the first
 * couple of pages are sent (truncated server-side with pdf-lib), never the
 * full file — the paywall is enforced by what bytes leave the server, not
 * just by hiding buttons in the UI.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { documentId } = await params;
  const supabase = supabaseAdmin();

  const { data: document } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle<DbDocument>();

  if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const owned = await userCanAccessDocument(session.sub, document);

  const { data: file, error } = await supabase.storage
    .from("documents")
    .download(document.file_path);

  if (error || !file) {
    return NextResponse.json({ error: "File unavailable" }, { status: 404 });
  }

  const bytes = await file.arrayBuffer();

  const baseHeaders = {
    "Content-Type": "application/pdf",
    "Content-Disposition": "inline",
    "X-Kaolo-Subject": encodeURIComponent(document.subject),
    "X-Kaolo-Level": document.level,
    "X-Kaolo-Year": String(document.year),
    "X-Kaolo-Type": document.type,
  };

  if (owned) {
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        ...baseHeaders,
        // Never cache this response: the exact same URL must return only a
        // preview to a different (or logged-out) user on this same device.
        // A shared browser/HTTP cache has no concept of "who's asking" —
        // caching this as long-lived here previously let anyone on a device
        // that had once viewed the full document keep seeing it after
        // switching accounts, bypassing the paywall entirely.
        "Cache-Control": "private, no-store",
        "X-Kaolo-Preview": "false",
      },
    });
  }

  const totalPages = await getPdfPageCount(bytes);
  const previewPages = previewPageCount(totalPages);

  if (previewPages === 0) {
    return NextResponse.json(
      { error: "Purchase required to view this document", totalPages },
      { status: 403 }
    );
  }

  const preview = await truncatePdf(bytes, previewPages);

  return new NextResponse(Buffer.from(preview), {
    status: 200,
    headers: {
      ...baseHeaders,
      "Cache-Control": "private, no-store",
      "X-Kaolo-Preview": "true",
      "X-Kaolo-Preview-Pages": String(previewPages),
      "X-Kaolo-Total-Pages": String(totalPages),
    },
  });
}
