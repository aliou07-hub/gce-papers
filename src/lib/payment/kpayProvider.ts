import "server-only";
import type { InitiatePaymentInput, InitiatePaymentResult, PaymentProvider } from "./types";

interface KpayConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

/** KPAY-NOW gateway mode: the customer picks MTN/Orange and enters their number on KPAY's hosted page. */
export class KpayProvider implements PaymentProvider {
  constructor(private readonly config: KpayConfig) {}

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const res = await fetch(`${this.config.baseUrl}/api/v1/payments/init`, {
      method: "POST",
      headers: {
        "X-API-Key": this.config.apiKey,
        "X-Secret-Key": this.config.secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amountFcfa,
        currency: "XAF",
        externalId: input.purchaseId,
        returnUrl: `${input.siteUrl}/purchases`,
        successUrl: `${input.siteUrl}/purchases`,
        cancelUrl: `${input.siteUrl}/`,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) throw new Error(`KPAY init failed with status ${res.status}`);

    const data = (await res.json()) as { id?: string; gatewayUrl?: string };
    if (!data.id || !data.gatewayUrl) throw new Error("KPAY init returned no payment page");

    return { reference: data.id, confirmed: false, redirectUrl: data.gatewayUrl };
  }
}
