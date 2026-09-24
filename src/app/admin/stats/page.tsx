import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/AdminNav";
import { SalesStats } from "@/components/admin/SalesStats";

export default async function AdminStatsPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-5 py-6">
        <SalesStats />
      </main>
    </>
  );
}
