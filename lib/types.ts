export type UserRole = "umkm" | "lender" | "admin";
export type OrgType = "bank" | "fintech" | "cooperative" | "multifinance";
export type TransactionType = "payment" | "refund" | "transfer" | "top_up";
export type RiskLevel = "low" | "medium" | "high";
export type LoanStatus = "active" | "paid" | "overdue" | "defaulted";
export type MatchStatus = "pending" | "accepted" | "rejected" | "expired";

export interface UserOut {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface OrganizationOut {
  id: string;
  name: string;
  type: OrgType;
  license_no: string | null;
  is_active: boolean;
}

export interface LenderProfileOut {
  id: string;
  user_id: string;
  organization_id: string;
  position: string | null;
  max_loan_amount: number | null;
  min_acs_score: number | null;
}

export interface UMKMProfileOut {
  id: string;
  user_id: string;
  business_name: string | null;
  business_type: string | null;
  city: string | null;
  province: string | null;
  monthly_revenue: number | null;
  years_operating: number | null;
  employee_count: number | null;
}

export interface QrisTransactionOut {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: TransactionType;
  merchant_name: string | null;
  transaction_time: string;
  city: string | null;
  is_refund: boolean;
  fraud_flag: boolean;
}

export interface ScoreOut {
  id: string;
  user_id: string;
  acs_score: number;
  risk_level: RiskLevel;
  confidence_score: number | null;
  prediction_label: string | null;
  model_version: string | null;
  /**
   * Tidak dikirim oleh `ScoreOut` di backend saat ini (kolom `created_at` ada
   * di tabel `scores` tapi tidak diekspos di schema). Ditandai opsional supaya
   * pemakaiannya di FE wajib lewat pengecekan, bukan menghasilkan
   * `new Date(undefined)` -> Invalid Date.
   */
  created_at?: string;
}

export interface MatchOut {
  id: string;
  umkm_id: string;
  lender_id: string;
  match_score: number | null;
  status: MatchStatus;
  recommended_limit: number | null;
  recommended_interest: number | null;
  reason: string | null;
}

export interface LoanOutcomeOut {
  id: string;
  user_id: string;
  lender_id: string;
  loan_amount: number;
  loan_term_months: number;
  due_date: string;
  paid_at: string | null;
  days_past_due: number | null;
  status: LoanStatus;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ACSScoreResponse {
  user_id: string;
  acs_score: number;
  risk_level: string;
  model_version: string;
  is_cold_start: boolean;
  transaction_count: number;
  scored_at: string;
  business_explanation: {
    category: string;
    impact: string;
    summary: string;
  }[];
  technical_explanation: {
    probability_of_default: number;
    probability_of_default_raw_uncalibrated: number;
    top_drivers: {
      feature: string;
      shap_contribution: number;
      direction: string;
      raw_value: number;
    }[];
  } | null;
}

export interface BackendDetailError {
  detail: string;
}

export interface BackendValidationDetail {
  type: string;
  loc: (string | number)[];
  msg: string;
  input: unknown;
}
