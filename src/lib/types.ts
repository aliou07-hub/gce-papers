export type GceLevel = "O_LEVEL" | "A_LEVEL";
export type DocumentType = "QUESTIONS" | "MARKING_SCHEME";
export type PaymentStatus = "pending" | "confirmed" | "failed";

export interface DbUser {
  id: string;
  phone_number: string;
  password_hash: string;
  created_at: string;
}

export interface DbAdmin {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface DbDocument {
  id: string;
  level: GceLevel;
  year: number;
  subject: string;
  type: DocumentType;
  file_path: string;
  price_fcfa: number;
  created_at: string;
}

export interface DbPurchase {
  id: string;
  user_id: string;
  document_id: string | null;
  second_document_id: string | null;
  bundle_level: GceLevel | null;
  bundle_year: number | null;
  subject: string | null;
  amount_paid_fcfa: number;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  momo_number: string;
  created_at: string;
  confirmed_at: string | null;
}

export interface SessionUser {
  sub: string;
  phone: string;
  role: "student";
}

export interface SessionAdmin {
  sub: string;
  username: string;
  role: "admin";
}

/** One purchasable paper within a subject (e.g. "Paper 1 (MCQ)"). `label` is
 * null for a subject with a single paper, so it renders without a sub-row. */
export interface PaperOffering {
  label: string | null;
  questions?: DbDocument;
  markingScheme?: DbDocument;
}

/** What a student can buy for one subject in one year/level — one or more papers. */
export interface SubjectOffering {
  subject: string;
  papers: PaperOffering[];
}
