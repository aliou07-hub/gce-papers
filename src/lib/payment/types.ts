export type MomoOperator = "MTN" | "ORANGE";

export interface InitiatePaymentInput {
  amountFcfa: number;
  momoNumber: string;
  operator: MomoOperator;
  /** Our internal purchase id, so the provider's webhook/confirmation can be matched back. */
  purchaseId: string;
}

export interface InitiatePaymentResult {
  /** Provider-side transaction reference. */
  reference: string;
  /** True if the provider confirms immediately (mock mode); false if the caller must poll/wait for a webhook. */
  confirmed: boolean;
}

export interface PaymentProvider {
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
}
