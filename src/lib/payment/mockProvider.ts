import "server-only";
import { randomUUID } from "crypto";
import type { InitiatePaymentInput, InitiatePaymentResult, PaymentProvider } from "./types";

/**
 * Stand-in for the real Kpay integration. Simulates a mobile money charge:
 * always "confirms" after a short delay, no real money moves. Swap this out
 * in ./index.ts once Kpay credentials are available — nothing else in the
 * app talks to a payment provider directly.
 */
export class MockPaymentProvider implements PaymentProvider {
  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      reference: `MOCK-${randomUUID()}`,
      confirmed: true,
    };
  }
}
