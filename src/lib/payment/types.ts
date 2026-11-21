export interface InitiatePaymentInput {
  amountFcfa: number;
  /** Our internal purchase id, sent to the provider so its webhook can be matched back. */
  purchaseId: string;
  /** Public origin of the site, used to build the payment return URLs. */
  siteUrl: string;
}

export interface InitiatePaymentResult {
  /** Provider-side transaction reference. */
  reference: string;
  /** True if the provider confirms immediately (mock mode); false if the caller must wait for a webhook. */
  confirmed: boolean;
  /** Hosted payment page to send the customer to, when the provider uses one. */
  redirectUrl?: string;
}

export interface PaymentProvider {
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
}
