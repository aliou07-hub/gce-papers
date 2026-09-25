import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** TEMPORARY diagnostic endpoint — reveals zero characters of any secret, only per-variable codepoint scan results. Remove after use. */
function scanForBadChars(name: string, v: string | undefined) {
  if (v === undefined) return { present: false };
  const badPositions: { index: number; code: number }[] = [];
  for (let i = 0; i < v.length; i++) {
    const code = v.charCodeAt(i);
    if (code > 255) badPositions.push({ index: i, code });
  }
  return {
    present: true,
    length: v.length,
    badPositions: badPositions.slice(0, 5),
    totalBadChars: badPositions.length,
  };
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: scanForBadChars("url", url),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: scanForBadChars("anon", anon),
    SUPABASE_SERVICE_ROLE_KEY: scanForBadChars("service", service),
    region: process.env.VERCEL_REGION ?? null,
  });
}
