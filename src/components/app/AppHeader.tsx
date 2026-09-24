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
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-accent-a/10 bg-bg-deep/70 px-5 py-3.5 backdrop-blur-xl">
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
