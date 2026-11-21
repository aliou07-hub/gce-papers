"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CheckBadgeIcon, TONES, IconBadge } from "@/components/ui/IconBadge";

type Step = "loading" | "form" | "confirm" | "sending" | "waiting" | "done" | "error";
type Operator = "MTN" | "ORANGE";

const POLL_EVERY_MS = 4000;
const GIVE_UP_AFTER_MS = 3 * 60 * 1000;

export function CheckoutFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams.entries());

  const [step, setStep] = useState<Step>("loading");
  const [quote, setQuote] = useState<{ label: string; amountFcfa: number } | null>(null);
  const [momoNumber, setMomoNumber] = useState("");
  const [operator, setOperator] = useState<Operator>("MTN");
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
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

  // While the student approves on their phone, check every few seconds.
  useEffect(() => {
    if (step !== "waiting" || !purchaseId) return;
    let stopped = false;
    const started = Date.now();

    async function check() {
      if (stopped) return;
      try {
        const res = await fetch(`/api/purchases/${purchaseId}/status`, { cache: "no-store" });
        const data = await res.json();
        if (stopped) return;
        if (data.status === "confirmed") return setStep("done");
        if (data.status === "failed") {
          setError("The payment was declined or cancelled. Check your balance and try again.");
          return setStep("form");
        }
      } catch {
        // network blip: just try again next round
      }
      if (Date.now() - started > GIVE_UP_AFTER_MS) {
        setError(
          "We haven't received the confirmation yet. If you approved the payment, your paper will appear in My Purchases shortly."
        );
        return setStep("form");
      }
      setTimeout(check, POLL_EVERY_MS);
    }

    const first = setTimeout(check, POLL_EVERY_MS);
    return () => {
      stopped = true;
      clearTimeout(first);
    };
  }, [step, purchaseId]);

  /** First tap: only checks the number and shows the summary. Nothing is sent yet. */
  function reviewPayment() {
    setError(null);
    const digits = momoNumber.replace(/\D/g, "").replace(/^237/, "");
    if (!/^6\d{8}$/.test(digits)) {
      setError("Enter your 9-digit Mobile Money number, e.g. 6XX XXX XXX.");
      return;
    }
    setMomoNumber(digits);
    setStep("confirm");
  }

  /** Second tap, on "Yes, send the request": the only place a payment is started. */
  async function sendPaymentRequest() {
    if (step !== "confirm") return;
    setError(null);
    setStep("sending");
    try {
      const res = await fetch("/api/purchases/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...query, momoNumber, operator }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment failed");
      if (data.confirmed) return setStep("done");
      setPurchaseId(data.purchaseId);
      setStep("waiting");
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

  if (step === "waiting") {
    return (
      <GlassPanel className="flex flex-col items-center p-8 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent-a/25 border-t-accent-a" />
        <h1 className="mt-5 text-xl font-bold text-ink">Check your phone</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">
          A payment request of{" "}
          <span className="font-semibold text-ink">{quote?.amountFcfa.toLocaleString()} FCFA</span>{" "}
          was sent to <span className="font-semibold text-ink">{momoNumber}</span>.
          <br />
          Enter your {operator === "MTN" ? "MTN MoMo" : "Orange Money"} PIN code to approve it.
        </p>
        <p className="mt-4 rounded-control bg-accent-a/8 px-4 py-3 text-sm text-ink-dim">
          No message on your phone? Dial{" "}
          <span className="font-semibold text-ink">{operator === "MTN" ? "*126#" : "#150*50#"}</span>{" "}
          to see and approve the pending payment.
        </p>
        <p className="mt-4 text-xs text-ink-faint">
          This page updates by itself. Don&apos;t close it.
        </p>
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
        <Button className="mt-6 w-full py-3.5 text-base" onClick={() => router.push("/purchases")}>
          Open my purchases
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

      {(step === "confirm" || step === "sending") ? (
        <div className="mt-5 flex flex-col gap-4">
          <div className="rounded-control border-2 border-accent-b/30 bg-accent-b/5 p-4">
            <p className="text-sm font-semibold text-ink">Please check before paying:</p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[15px]">
              <dt className="text-ink-dim">Network</dt>
              <dd className="font-semibold text-ink">
                {operator === "MTN" ? "MTN MoMo" : "Orange Money"}
              </dd>
              <dt className="text-ink-dim">Number</dt>
              <dd className="font-semibold tracking-wide text-ink">{momoNumber}</dd>
              <dt className="text-ink-dim">Amount</dt>
              <dd className="font-semibold text-ink">{quote?.amountFcfa.toLocaleString()} FCFA</dd>
            </dl>
          </div>

          {error && (
            <p role="alert" className="rounded-control bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <Button
            type="button"
            onClick={sendPaymentRequest}
            disabled={step === "sending"}
            className="w-full py-3.5 text-base"
          >
            {step === "sending" ? "Sending request to your phone…" : "Yes, send the request"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep("form")}
            disabled={step === "sending"}
            className="w-full"
          >
            Change number
          </Button>
        </div>
      ) : (
      <div className="mt-5 flex flex-col gap-5">
        <div>
          <span className="mb-2 block text-sm font-medium text-ink">1. Choose your network</span>
          <div className="grid grid-cols-2 gap-2">
            {(["MTN", "ORANGE"] as const).map((op) => (
              <button
                type="button"
                key={op}
                onClick={() => setOperator(op)}
                aria-pressed={operator === op}
                className={`rounded-control border-2 px-4 py-3 text-[15px] font-semibold transition-colors ${
                  operator === op
                    ? op === "MTN"
                      ? "border-[#e6b800] bg-[#ffcc00]/20 text-ink"
                      : "border-[#ff7900] bg-[#ff7900]/12 text-ink"
                    : "border-glass-border bg-white text-ink-dim"
                }`}
              >
                {op === "MTN" ? "MTN MoMo" : "Orange Money"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="momo" className="mb-1 block text-sm font-medium text-ink">
            2. Your Mobile Money number
          </label>
          <Input
            id="momo"
            type="tel"
            inputMode="numeric"
            name="momo-entry"
            autoComplete="off"
            maxLength={16}
            placeholder="6XX XXX XXX"
            value={momoNumber}
            onChange={(e) => setMomoNumber(e.target.value)}
            onKeyDown={(e) => {
              // The keyboard's Enter/Go key never starts a payment.
              if (e.key === "Enter") e.preventDefault();
            }}
            className="text-lg tracking-wide"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-control bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="button" onClick={reviewPayment} className="w-full py-3.5 text-base">
          Continue
        </Button>
        <p className="-mt-2 text-center text-xs text-ink-faint">
          You will check your details, then confirm with your PIN code on your phone.
        </p>
      </div>
      )}
    </GlassPanel>
  );
}
