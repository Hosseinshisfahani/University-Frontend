import type { Appointment, PsychometricResponse, Therapist } from "./types";

export type Paginated<T> = {
  count: number;
  page: number;
  page_size: number;
  results: T[];
};

export type AdminOverview = {
  upcoming_confirmed_count: number;
  canceled_this_week: number;
  patients_count: number;
  therapists_active_count: number;
  pending_reviews_count: number;
  revenue_7d: string;
  capture_7d: string;
  refund_7d: string;
  recent_appointments: Appointment[];
};

export type AdminPatientSummary = {
  id: number;
  username: string;
  display_name: string;
  email: string;
  phone: string;
  national_id: string;
  appointments_count: number;
  last_appointment_at: string | null;
  last_appointment_status: string | null;
  wallet_balance: string;
};

export type AdminPatientDetail = AdminPatientSummary & {
  first_name: string;
  last_name: string;
  birth_date: string | null;
  recent_appointments: Appointment[];
  recent_responses: PsychometricResponse[];
};

export type AdminTherapistSummary = Therapist & {
  username: string;
  email: string;
  appointments_count: number;
  open_slots_14d: number;
};

export type AdminTherapistDetail = AdminTherapistSummary & {
  availability_count: number;
  offers: {
    id: number;
    session_type_id: number;
    session_type_name: string;
    is_active: boolean;
  }[];
  recent_appointments: Appointment[];
};

export type FinanceSummary = {
  from: string;
  to: string;
  sep_succeeded_total: string;
  sep_succeeded_count: number;
  appointment_capture_total: string;
  appointment_capture_count: number;
  refund_total: string;
  refund_count: number;
  net_appointment_revenue: string;
};

export type FinanceLedgerRow = {
  id: number;
  username: string;
  wallet_id: number;
  direction: string;
  amount: string;
  balance_after: string;
  entry_type: string;
  reference: string;
  description: string;
  created_at: string;
};

export type FinancePaymentRow = {
  id: number;
  username: string;
  amount: string;
  status: string;
  provider: string;
  provider_ref: string;
  purpose: string;
  created_at: string;
};

export type FinanceRevenueRow = {
  id: number;
  username: string;
  entry_type: string;
  direction: string;
  amount: string;
  reference: string;
  appointment_id: number | null;
  created_at: string;
};

export type AppointmentListFilters = {
  page?: number;
  page_size?: number;
  therapist?: number;
  patient?: number;
  status?: string;
  from?: string;
  to?: string;
};
