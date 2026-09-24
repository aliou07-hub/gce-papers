import { AuthForm } from "@/components/app/AuthForm";

export const metadata = { title: "Sign up — GCE Papers" };

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <AuthForm mode="signup" />
    </main>
  );
}
