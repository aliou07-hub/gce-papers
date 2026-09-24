export const metadata = { title: "Admin — GCE Papers" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-[#0b0c10] text-white">{children}</div>;
}
