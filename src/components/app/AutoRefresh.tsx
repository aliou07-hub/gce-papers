"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-fetches the server page every few seconds (used while a payment is
 * waiting for KPAY's confirmation), stopping after a few minutes. */
export function AutoRefresh({ everyMs = 5000, maxMs = 5 * 60 * 1000 }: { everyMs?: number; maxMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      if (Date.now() - started > maxMs) return clearInterval(id);
      router.refresh();
    }, everyMs);
    return () => clearInterval(id);
  }, [router, everyMs, maxMs]);
  return null;
}
