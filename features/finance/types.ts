export type Wallet = {
  id: number;
  balance: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LedgerEntryType =
  | "deposit"
  | "appointment_hold"
  | "appointment_capture"
  | "refund"
  | "forfeit"
  | "workshop_purchase"
  | "withdrawal"
  | "withdrawal_reversal"
  | "adjustment";

export type LedgerEntry = {
  id: number;
  direction: "credit" | "debit";
  amount: string;
  balance_after: string;
  entry_type: LedgerEntryType | string;
  reference: string;
  description: string;
  created_at: string;
};

export type PaginatedLedger = {
  count: number;
  page: number;
  page_size: number;
  results: LedgerEntry[];
};

export type SepInitiateResponse = {
  payment: {
    id: number;
    amount: string;
    status: string;
    provider_ref: string;
  };
  redirect_url: string;
  provider_ref: string;
  sandbox: boolean;
};

export function formatIrr(amount: string | number): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("fa-IR").format(n) + " ریال";
}

export function formatToman(amount: string | number): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("fa-IR").format(Math.floor(n / 10)) + " تومان";
}

const LEDGER_ENTRY_TYPE_FA: Record<LedgerEntryType, string> = {
  deposit: "شارژ حساب",
  appointment_hold: "رزرو نوبت",
  appointment_capture: "پرداخت نوبت",
  refund: "بازپرداخت",
  forfeit: "ضبط وجه",
  workshop_purchase: "ثبت نام کارگاه",
  withdrawal: "برداشت",
  withdrawal_reversal: "برگشت برداشت",
  adjustment: "تعدیل",
};

export function formatLedgerEntryType(entryType: string): string {
  return LEDGER_ENTRY_TYPE_FA[entryType as LedgerEntryType] ?? entryType;
}

export const LEDGER_ENTRY_TYPE_OPTIONS: { value: LedgerEntryType; label: string }[] =
  (Object.entries(LEDGER_ENTRY_TYPE_FA) as [LedgerEntryType, string][]).map(
    ([value, label]) => ({ value, label }),
  );

export function formatLedgerDirection(direction: string): string {
  if (direction === "credit") return "واریز";
  if (direction === "debit") return "برداشت";
  return direction;
}

export function formatPaymentPurpose(purpose: string): string {
  const map: Record<string, string> = {
    "wallet-topup": "شارژ کیف پول",
    topup: "شارژ کیف پول",
  };
  return map[purpose] || purpose || "—";
}
