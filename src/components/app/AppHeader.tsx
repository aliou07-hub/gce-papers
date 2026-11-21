"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-4 z-10 mx-auto flex w-[calc(100%-2rem)] max-w-2xl items-center justify-between rounded-full border border-glass-border bg-white/90 px-5 py-3 shadow-[0_8px_24px_-12px_rgba(28,23,18,0.25)] backdrop-blur-xl">
      <Link href="/level" className="flex items-center gap-2 text-[15px] font-bold text-ink">
        <Image src="/branding/icon.png" alt="" width={24} height={24} className="h-6 w-6" />
        GCE Papers
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link
          href="/purchases"
          className={pathname === "/purchases" ? "text-ink font-medium" : "text-ink-dim"}
        >
          My Purchases
        </Link>
        <button onClick={logout} className="text-ink-dim">
          Log out
        </button>
      </nav>
    </header>
  );
}
