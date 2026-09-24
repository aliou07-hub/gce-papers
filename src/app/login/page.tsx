import { AuthForm } from "@/components/app/AuthForm";

export const metadata = { title: "Log in — GCE Papers" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <AuthForm mode="login" />
    </main>
  );
}
