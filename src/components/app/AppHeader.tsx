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
    <header className="sticky top-4 z-10 mx-auto flex w-[calc(100%-2rem)] max-w-2xl items-center justify-between rounded-full border border-white/14 bg-white/8 px-5 py-3 shadow-[0_1px_0_rgba(255,255,255,0.16)_inset,0_20px_50px_-20px_rgba(0,0,0,0.7)] backdrop-blur-2xl backdrop-saturate-150">
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
