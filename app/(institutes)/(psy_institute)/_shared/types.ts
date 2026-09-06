export type TherapistReview = {
  id: number;
  appointment: number;
  patient: number;
  patient_first_name: string;
  therapist: number;
  therapist_name: string;
  rating: number;
  body: string;
  text_status: "none" | "pending" | "approved" | "rejected" | string;
  admin_note?: string;
  created_at: string;
  reviewed_at?: string | null;
};

export type PublicTherapistReview = {
  id: number;
  rating: number;
  body: string;
  patient_first_name: string;
  created_at: string;
};

export type Therapist = {
  id: number;
  display_name: string;
  bio: string;
  specialties: string[];
  is_accepting_patients: boolean;
  is_active: boolean;
  offers?: TherapistSessionOffer[];
  rating_avg?: number | null;
  rating_count?: number;
};

export type SessionType = {
  id: number;
  name: string;
  slug: string;
  modality: string;
  duration_minutes: number;
  price: string;
  buffer_minutes: number;
  is_active: boolean;
};

export type AppointmentSlot = {
  id: number;
  therapist: Therapist;
  session_type: SessionType | null;
  starts_at: string;
  ends_at: string;
  status: string;
  hold_expires_at: string | null;
};

export type Appointment = {
  id: number;
  slot: number;
  patient: number;
  patient_name?: string;
  therapist: number;
  therapist_name: string;
  session_type: number;
  session_type_name: string;
  session_type_modality: string;
  starts_at: string;
  ends_at: string;
  status: string;
  price_snapshot: string;
  payment_ref: string;
  canceled_at: string | null;
  cancellation_reason: string;
  refund_policy_applied: string;
  meeting_link: string;
  created_at: string;
  review?: TherapistReview | null;
};

export type SessionNote = {
  id: number;
  appointment: number;
  appointment_starts_at: string;
  therapist_name: string;
  body: string;
  shared_with_patient: boolean;
  created_at: string;
  updated_at: string;
};

export type PsychometricField = {
  id: string;
  type: "likert" | "text" | "single" | "multi" | string;
  label: string;
  required?: boolean;
  options?: string[];
};

export type PsychometricSchema = {
  fields: PsychometricField[];
};

export type PsychometricForm = {
  id: number;
  title: string;
  slug: string;
  description: string;
  schema: PsychometricSchema;
  version: number;
  is_published: boolean;
};

export type PsychometricResponse = {
  id: number;
  form: number;
  form_version: number;
  patient?: number;
  patient_name?: string;
  answers: Record<string, unknown>;
  routed_therapist: number | null;
  status: string;
  submitted_at: string;
  reviewer_notes: string;
};

export type TherapistAvailability = {
  id: number;
  weekday: number;
  start_time: string;
  end_time: string;
  timezone: string;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
};

export type AvailabilityException = {
  id: number;
  date: string;
  is_day_off: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string;
};

export type TherapistSessionOffer = {
  id: number;
  session_type: SessionType;
  is_active: boolean;
};

export type LeaveRequest = {
  id: number;
  therapist: number;
  therapist_name: string;
  starts_on: string;
  ends_on: string;
  start_time: string | null;
  end_time: string | null;
  reason: string;
  status: "pending" | "approved" | "rejected" | "canceled" | string;
  admin_note: string;
  reviewed_at: string | null;
  created_at: string;
};

export type LeaveRequestWrite = {
  starts_on: string;
  ends_on: string;
  reason: string;
  start_time?: string | null;
  end_time?: string | null;
};

export type AdminAppointmentSlot = AppointmentSlot & {
  appointment_id: number | null;
  appointment_status: string | null;
  patient_name: string | null;
};

export type AdminBookPayment = "pending" | "wallet" | "offline";

export type AvailabilityWrite = {
  weekday: number;
  start_time: string;
  end_time: string;
  timezone?: string;
  valid_from: string;
  valid_until?: string | null;
  is_active?: boolean;
};

export type ExceptionWrite = {
  date: string;
  is_day_off?: boolean;
  start_time?: string | null;
  end_time?: string | null;
  reason?: string;
};

export type TherapistPatientSummary = {
  id: number;
  display_name: string;
  phone: string;
  appointments_count: number;
  last_appointment_at: string | null;
  last_appointment_status: string | null;
  notes_count: number;
};

export type TherapistPatientDetail = TherapistPatientSummary & {
  recent_appointments: Appointment[];
  recent_notes: SessionNote[];
  recent_responses: PsychometricResponse[];
};

export type TherapistFinanceAppointment = {
  id: number;
  starts_at: string;
  session_type_name: string;
  patient_id: number;
  patient_name: string;
  amount: string;
  status: string;
};

export type TherapistFinanceReport = {
  start_date: string;
  end_date: string;
  total_income: string;
  paid_sessions_count: number;
  upcoming_potential_revenue: string;
  appointments: TherapistFinanceAppointment[];
};

export type Workshop = {
  id: number;
  title: string;
  slug: string;
  description: string;
  body_md?: string;
  instructor_id: number | null;
  instructor_name: string | null;
  capacity: number;
  price: string;
  starts_at: string | null;
  ends_at: string | null;
  banner_image: string;
  recording_url: string;
  is_published: boolean;
  certificate_enabled: boolean;
  seats_taken: number;
  seats_remaining: number;
  is_full: boolean;
  viewer_has_access?: boolean;
  progress_percent?: number | null;
  certificate?: WorkshopCertificate | null;
  sessions?: WorkshopSessionPublic[];
  resources?: WorkshopResourcePublic[];
};

export type WorkshopWrite = {
  title: string;
  slug: string;
  description?: string;
  body_md?: string;
  instructor_id?: number | null;
  capacity: number;
  price: string | number;
  starts_at?: string | null;
  ends_at?: string | null;
  banner_image?: string | null;
  recording_url?: string;
  is_published?: boolean;
  certificate_enabled?: boolean;
};

export type WorkshopResourcePublic = {
  id: number;
  sort_order: number;
  title: string;
  kind: string;
  has_file: boolean;
  file_url: string | null;
  is_locked: boolean;
  session_id: number | null;
};

export type WorkshopSessionPublic = {
  id: number;
  sort_order: number;
  title: string;
  summary: string;
  starts_at: string | null;
  ends_at: string | null;
  has_meeting: boolean;
  has_recording: boolean;
  meeting_url: string | null;
  recording_url: string | null;
  is_locked: boolean;
  completed: boolean;
  resources: WorkshopResourcePublic[];
};

export type WorkshopCertificate = {
  id: number;
  certificate_code: string;
  issued_at: string;
  file: string | null;
};

export type WorkshopSessionWrite = {
  id?: number;
  sort_order: number;
  title: string;
  summary?: string;
  starts_at?: string | null;
  ends_at?: string | null;
  meeting_url?: string;
  recording_url?: string;
};

export type WorkshopResourceWrite = {
  id?: number;
  session?: number | null;
  sort_order: number;
  title: string;
  kind: string;
  file_url?: string;
};

export type WorkshopEnrollment = {
  id: number;
  workshop: number;
  workshop_title: string;
  workshop_slug: string;
  workshop_starts_at: string | null;
  workshop_ends_at: string | null;
  workshop_banner_image: string;
  instructor_name: string | null;
  patient: number;
  patient_name: string;
  patient_phone: string;
  status: string;
  price_snapshot: string;
  hold_expires_at: string | null;
  payment_ref: string;
  deposit_ledger_ref: string;
  refund_ledger_ref: string;
  canceled_at: string | null;
  cancellation_reason: string;
  enrolled_at: string;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  is_published: boolean;
  published_at: string | null;
  author_name?: string | null;
  author_therapist_id?: number | null;
};

export type BlogPostWrite = {
  title: string;
  slug: string;
  excerpt?: string;
  body: string;
  cover_image?: string | null;
  is_published?: boolean;
  published_at?: string | null;
};

export type BlogPostPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: BlogPost[];
};
