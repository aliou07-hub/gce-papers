import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** TEMPORARY diagnostic endpoint — reveals zero characters of any secret, only presence/length/whitespace flags and a live connectivity test's status code and timing. Remove after use. */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;

  function shape(v: string | null) {
    if (v === null) return { present: false };
    return {
      present: true,
      length: v.length,
      hasLeadingOrTrailingWhitespace: v !== v.trim(),
      hasQuotes: v.includes('"') || v.includes("'"),
      hasNewline: v.includes("\n") || v.includes("\r"),
    };
  }

  let liveTest: unknown = null;
  const startedAt = Date.now();
  try {
    if (url && service) {
      const res = await fetch(`${url}/rest/v1/admins?select=id&limit=1`, {
        headers: { apikey: service, Authorization: `Bearer ${service}` },
        signal: AbortSignal.timeout(8000),
      });
      liveTest = { status: res.status, ok: res.ok, ms: Date.now() - startedAt };
    } else {
      liveTest = { skipped: "url or service key missing" };
    }
  } catch (e) {
    liveTest = {
      threw: true,
      ms: Date.now() - startedAt,
      name: e instanceof Error ? e.name : typeof e,
      message: e instanceof Error ? e.message : String(e),
      cause: e instanceof Error && e.cause ? String(e.cause) : undefined,
    };
  }

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: shape(url),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: shape(anon),
    SUPABASE_SERVICE_ROLE_KEY: shape(service),
    liveTest,
    region: process.env.VERCEL_REGION ?? null,
  });
}
