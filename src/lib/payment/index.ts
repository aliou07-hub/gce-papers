import "server-only";
import { KpayProvider } from "./kpayProvider";
import { MockPaymentProvider } from "./mockProvider";
import type { PaymentProvider } from "./types";

export type {
  InitiatePaymentInput,
  InitiatePaymentResult,
  PaymentProvider,
  MomoOperator,
} from "./types";

/**
 * Single point of truth for which payment provider is active. KPAY is used as
 * soon as its keys are set; without them, dev falls back to the mock. In
 * production a missing key is an error, so purchases can never be unlocked for free.
 */
export function getPaymentProvider(): PaymentProvider {
  const apiKey = process.env.KPAY_API_KEY;
  const secretKey = process.env.KPAY_SECRET_KEY;
  if (apiKey && secretKey) {
    return new KpayProvider({
      apiKey,
      secretKey,
      baseUrl: (process.env.KPAY_BASE_URL || "https://admin.kpay.site").replace(/\/$/, ""),
    });
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Payment provider is not configured");
  }
  return new MockPaymentProvider();
}
