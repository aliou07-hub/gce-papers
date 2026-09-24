import "server-only";
import { MockPaymentProvider } from "./mockProvider";
import type { PaymentProvider } from "./types";

export type { InitiatePaymentInput, InitiatePaymentResult, MomoOperator, PaymentProvider } from "./types";

/**
 * Single point of truth for which payment provider is active. Once Kpay
 * credentials are set (see .env.local.example), replace this with a
 * KpayProvider implementing the same PaymentProvider interface — no other
 * file in the app needs to change.
 */
export function getPaymentProvider(): PaymentProvider {
  return new MockPaymentProvider();
}
