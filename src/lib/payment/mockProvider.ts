import "server-only";
import { randomUUID } from "crypto";
import type {
  InitiatePaymentInput,
  InitiatePaymentResult,
  PaymentProvider,
  ProviderStatusResult,
} from "./types";

/**
 * Local-development stand-in for KPAY: "confirms" immediately, no real money
 * moves. Never used in production (see ./index.ts).
 */
export class MockPaymentProvider implements PaymentProvider {
  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    void input;
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { reference: `MOCK-${randomUUID()}`, confirmed: true };
  }

  async getStatus(): Promise<ProviderStatusResult | null> {
    return null;
  }
}
