import "server-only";
import type {
  InitiatePaymentInput,
  InitiatePaymentResult,
  PaymentProvider,
  ProviderStatusResult,
} from "./types";

interface KpayConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

const PROVIDER_CODE = { MTN: "MTN_MOMO_CMR", ORANGE: "ORANGE_CMR" } as const;

/**
 * KPAY-NOW in USSD mode: the customer types their number on our site, KPAY
 * sends the payment request to their phone, they approve it with their PIN.
 */
export class KpayProvider implements PaymentProvider {
  constructor(private readonly config: KpayConfig) {}

  private headers() {
    return {
      "X-API-Key": this.config.apiKey,
      "X-Secret-Key": this.config.secretKey,
      "Content-Type": "application/json",
    };
  }

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const res = await fetch(`${this.config.baseUrl}/api/v1/payments/init`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        amount: input.amountFcfa,
        provider: PROVIDER_CODE[input.operator],
        phoneNumber: `237${input.momoNumber}`,
        externalId: input.purchaseId,
        description: input.description.slice(0, 120),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      // Visible in the Vercel logs so a refused payment can be diagnosed.
      console.error(`[kpay] init refused (HTTP ${res.status}): ${detail.slice(0, 500)}`);
      throw new Error(`KPAY init failed with status ${res.status}`);
    }

    const data = (await res.json()) as { id?: string; reference?: string };
    const reference = data.id ?? data.reference;
    if (!reference) throw new Error("KPAY init returned no payment id");

    return { reference, confirmed: false };
  }

  async getStatus(reference: string): Promise<ProviderStatusResult | null> {
    const res = await fetch(
      `${this.config.baseUrl}/api/v1/payments/${encodeURIComponent(reference)}`,
      { headers: this.headers(), cache: "no-store", signal: AbortSignal.timeout(10_000) }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { status?: string; amount?: number | string; externalId?: string };
    const raw = String(data.status ?? "").toUpperCase();
    const status =
      raw === "COMPLETED" ? "COMPLETED" : raw === "FAILED" || raw === "CANCELLED" ? "FAILED" : "PENDING";
    return { status, amount: Number(data.amount ?? 0), externalId: data.externalId ?? null };
  }
}
