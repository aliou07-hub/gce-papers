"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  // The PDF viewer is a fixed, full-viewport reader (its own PDF pages
  // already carry the same branding as a watermark) — a footer below it
  // would just force an extra scroll past a full screen of nothing.
  if (pathname?.startsWith("/viewer/")) return null;

  return (
    <footer className="flex items-center justify-center gap-2 px-5 py-6 text-xs text-ink-faint">
      <Image src="/branding/icon.png" alt="" width={16} height={16} className="h-4 w-4 opacity-70" />
      <span>GCE Papers — gcepapers.site</span>
    </footer>
  );
}
