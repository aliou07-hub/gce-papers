export type MomoOperator = "MTN" | "ORANGE";

export interface InitiatePaymentInput {
  amountFcfa: number;
  /** Our internal purchase id, sent to the provider so its webhook can be matched back. */
  purchaseId: string;
  /** Customer's Mobile Money number, 9 digits without country code (6XXXXXXXX). */
  momoNumber: string;
  operator: MomoOperator;
  /** Shown to the customer in the payment request. */
  description: string;
}

export interface InitiatePaymentResult {
  /** Provider-side transaction id. */
  reference: string;
  /** True if the provider confirms immediately (mock mode); false if the customer must approve on their phone. */
  confirmed: boolean;
}

export type ProviderPaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface ProviderStatusResult {
  status: ProviderPaymentStatus;
  amount: number;
  externalId: string | null;
}

export interface PaymentProvider {
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  /** Asks the provider directly for a payment's current status (server-to-server, authenticated). */
  getStatus(reference: string): Promise<ProviderStatusResult | null>;
}
