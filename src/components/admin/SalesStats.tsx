"use client";

import { useEffect, useState } from "react";
import type { DbPurchase } from "@/lib/types";

interface StatsResponse {
  today: { count: number; revenueFcfa: number };
  last7Days: { count: number; revenueFcfa: number };
  last30Days: { count: number; revenueFcfa: number };
  allTime: { count: number; revenueFcfa: number };
  recent: DbPurchase[];
}

export function SalesStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <p className="text-sm text-white/50">Loading…</p>;

  const cards = [
    { label: "Today", ...stats.today },
    { label: "Last 7 days", ...stats.last7Days },
    { label: "Last 30 days", ...stats.last30Days },
    { label: "All time", ...stats.allTime },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-white/10 bg-[#14151b] p-4">
            <p className="text-xs text-white/50">{c.label}</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {c.revenueFcfa.toLocaleString()} FCFA
            </p>
            <p className="text-xs text-white/40">{c.count} purchases</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-sm font-semibold text-white">Recent purchases</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="px-3 py-2 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((p) => (
                <tr key={p.id} className="border-t border-white/10">
                  <td className="px-3 py-2 text-white/70">
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-white">
                    {p.bundle_level
                      ? `${p.bundle_level === "O_LEVEL" ? "O Level" : "A Level"} ${p.bundle_year} bundle`
                      : p.subject}
                  </td>
                  <td className="px-3 py-2 text-white">{p.amount_paid_fcfa.toLocaleString()} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
