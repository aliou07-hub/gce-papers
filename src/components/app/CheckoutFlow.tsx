"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CheckBadgeIcon, TONES, IconBadge } from "@/components/ui/IconBadge";

type Step = "loading" | "form" | "paying" | "done" | "error";
type Operator = "MTN" | "ORANGE";

export function CheckoutFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams.entries());

  const [step, setStep] = useState<Step>("loading");
  const [quote, setQuote] = useState<{ label: string; amountFcfa: number } | null>(null);
  const [momoNumber, setMomoNumber] = useState("");
  const [operator, setOperator] = useState<Operator>("MTN");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qs = new URLSearchParams(query).toString();
    fetch(`/api/checkout/quote?${qs}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load this item");
        setQuote(data);
        setStep("form");
      })
      .catch((e) => {
        setError(e.message);
        setStep("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  async function confirmPurchase(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStep("paying");
    try {
      const res = await fetch("/api/purchases/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...query, momoNumber, operator }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment failed");
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
      setStep("form");
    }
  }

  if (step === "loading") {
    return <p className="text-center text-sm text-ink-dim">Loading…</p>;
  }

  if (step === "error") {
    return (
      <GlassPanel className="p-6 text-center">
        <p className="text-danger">{error}</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </GlassPanel>
    );
  }

  if (step === "done") {
    return (
      <GlassPanel className="flex flex-col items-center p-8 text-center">
        <IconBadge tone={TONES.mint} size={64}>
          <CheckBadgeIcon />
        </IconBadge>
        <h1 className="mt-4 text-xl font-bold text-ink">Payment confirmed</h1>
        <p className="mt-1 text-sm text-ink-dim">
          {quote?.label} is now unlocked in your purchases.
        </p>
        <Button className="mt-6 w-full" onClick={() => router.push("/purchases")}>
          View my purchases
        </Button>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="p-6">
      <h1 className="text-xl font-bold text-ink">Confirm purchase</h1>
      <div className="mt-4 rounded-control bg-accent-a/6 p-4">
        <p className="text-sm text-ink-dim">{quote?.label}</p>
        <p className="mt-1 text-2xl font-bold text-ink">
          {quote?.amountFcfa.toLocaleString()} FCFA
        </p>
      </div>

      <form onSubmit={confirmPurchase} className="mt-5 flex flex-col gap-4">
        <div>
          <span className="mb-1.5 block text-sm text-ink-dim">Mobile Money network</span>
          <div className="grid grid-cols-2 gap-2">
            {(["MTN", "ORANGE"] as const).map((op) => (
              <button
                type="button"
                key={op}
                onClick={() => setOperator(op)}
                className={`rounded-control border px-4 py-2.5 text-sm font-medium transition-colors ${
                  operator === op
                    ? "border-accent-a bg-accent-a/20 text-ink"
                    : "border-white/12 bg-white/5 text-ink-dim"
                }`}
              >
                {op === "MTN" ? "MTN MoMo" : "Orange Money"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="momo" className="mb-1.5 block text-sm text-ink-dim">
            Mobile Money number
          </label>
          <Input
            id="momo"
            type="tel"
            inputMode="tel"
            placeholder="6XX XXX XXX"
            value={momoNumber}
            onChange={(e) => setMomoNumber(e.target.value)}
            required
          />
        </div>

        {error && (
          <p role="alert" className="rounded-control bg-danger/15 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" disabled={step === "paying"} className="mt-1 w-full">
          {step === "paying" ? "Confirming payment…" : `Pay ${quote?.amountFcfa.toLocaleString()} FCFA`}
        </Button>
      </form>
    </GlassPanel>
  );
}
