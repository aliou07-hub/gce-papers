import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/AdminNav";
import { DocumentsManager } from "@/components/admin/DocumentsManager";

export default async function AdminDocumentsPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-5 py-6">
        <DocumentsManager />
      </main>
    </>
  );
}
