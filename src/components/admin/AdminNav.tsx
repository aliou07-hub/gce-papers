"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const tabs = [
    { href: "/admin/documents", label: "Documents" },
    { href: "/admin/stats", label: "Sales" },
  ];

  return (
    <header className="border-b border-white/10 px-5 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold text-white">GCE Papers admin</span>
          <nav className="flex gap-4 text-sm">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={pathname === tab.href ? "text-white" : "text-white/50"}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
        <button onClick={logout} className="text-sm text-white/50">
          Sign out
        </button>
      </div>
    </header>
  );
}
