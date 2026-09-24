"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/level");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <GlassPanel className="w-full max-w-sm !p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink/15 px-6 py-3 text-[11px] tracking-wide text-ink-dim">
        <span>GCE Papers</span>
        <span>{isSignup ? "New Candidate" : "Returning Candidate"}</span>
      </div>
      <div className="h-[3px] bg-ink" />

      <div className="p-6">
        <h1 className="text-2xl font-bold text-ink">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-ink-dim">
          {isSignup
            ? "Sign up with your phone number to start revising."
            : "Log in with your phone number and password."}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
          <div>
            <label htmlFor="phone" className="block text-[13px] text-ink-dim">
              Phone number
            </label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="6XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[13px] text-ink-dim">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? "At least 6 characters" : "Your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isSignup ? 6 : undefined}
            />
          </div>

          {error && (
            <p role="alert" className="border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-dim">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-accent-a-soft">
                Log in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/signup" className="font-medium text-accent-a-soft">
                Sign up
              </Link>
            </>
          )}
        </p>
      </div>
    </GlassPanel>
  );
}
