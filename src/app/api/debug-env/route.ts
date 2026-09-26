import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** TEMPORARY diagnostic endpoint — no secret content exposed, just shape info and a live connectivity test. Remove after use. */
function scanForBadChars(v: string | undefined) {
  if (v === undefined) return { present: false };
  const badPositions: { index: number; code: number }[] = [];
  for (let i = 0; i < v.length; i++) {
    const code = v.charCodeAt(i);
    if (code > 255) badPositions.push({ index: i, code });
  }
  const trimmed = v.trim();
  return {
    present: true,
    length: v.length,
    trimmedLength: trimmed.length,
    lastCharCode: v.charCodeAt(v.length - 1),
    totalBadChars: badPositions.length,
  };
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let liveTest: unknown = "skipped";
  if (url && service) {
    const trimmedUrl = url.trim();
    const trimmedService = service.trim();
    try {
      const res = await fetch(`${trimmedUrl}/rest/v1/admins?select=id&limit=1`, {
        headers: { apikey: trimmedService, Authorization: `Bearer ${trimmedService}` },
        signal: AbortSignal.timeout(8000),
      });
      const body = await res.text();
      liveTest = { status: res.status, ok: res.ok, bodyLength: body.length };
    } catch (e) {
      liveTest = { threw: true, message: e instanceof Error ? e.message : String(e) };
    }
  }

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: scanForBadChars(url),
    SUPABASE_SERVICE_ROLE_KEY: scanForBadChars(service),
    liveTest,
  });
}
