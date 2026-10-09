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
  avatarUrl?: string | null;
  profileImage?: string | null;
  avatar_url?: string | null;
  profile_image?: string | null;
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

export type ClinicalReport = {
  id: number;
  appointment: number;
  appointment_starts_at: string;
  session_type_name: string;
  therapist: number;
  therapist_name: string;
  patient: number;
  patient_name: string;
  summary: string;
  assessment: string;
  treatment_plan: string;
  risk_flags: string[];
  created_at: string;
  updated_at: string;
};

export type ClinicalReportWrite = {
  appointment: number;
  summary: string;
  assessment: string;
  treatment_plan: string;
  risk_flags?: string[];
};

export type FileAccessRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | string;

export type FileAccessRequest = {
  id: number;
  therapist: number;
  therapist_name: string;
  patient: number;
  patient_name: string;
  status: FileAccessRequestStatus;
  reason: string;
  decision_note: string;
  granted_by: number | null;
  granted_by_name: string | null;
  decided_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MissingReportAppointment = {
  id: number;
  patient: number;
  patient_name: string;
  therapist: number;
  therapist_name: string;
  session_type_name: string;
  starts_at: string;
  ends_at: string;
};

export type MissingReportsPayload = {
  count: number;
  items: MissingReportAppointment[];
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
  clinical_reports: ClinicalReport[];
  has_full_file_access: boolean;
  pending_file_access_request: FileAccessRequest | null;
  other_therapists_report_count: number;
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

export type NewsSlide = {
  id: number;
  title: string;
  body: string;
  image: string | null;
  link_url: string;
  link_label: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type NewsSlideWrite = {
  title: string;
  body?: string;
  image?: string | null;
  link_url?: string;
  link_label?: string;
  sort_order?: number;
  is_published?: boolean;
};

export type ProductKind = "physical" | "digital";

export type ProductCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  is_active: boolean;
};

export type Product = {
  id: number;
  title: string;
  slug: string;
  category: number | null;
  category_name: string | null;
  category_slug: string | null;
  kind: ProductKind | string;
  description: string;
  body_md: string;
  price: string;
  compare_at_price: string | null;
  image: string | null;
  has_digital_file: boolean;
  viewer_can_download: boolean;
  is_published: boolean;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductWrite = {
  title: string;
  slug: string;
  category?: number | null;
  kind: string;
  description?: string;
  body_md?: string;
  price: string | number;
  compare_at_price?: string | number | null;
  is_published?: boolean;
  is_available?: boolean;
  sort_order?: number;
};

export type ProductPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
};

export type ShopCatalogQuery = {
  category?: string;
  q?: string;
  kind?: string;
  ordering?: string;
  page?: number;
};

export type Coupon = {
  id: number;
  code: string;
  kind: "percent" | "fixed" | string;
  value: string;
  max_discount: string | null;
  min_order_total: string;
  starts_at: string | null;
  ends_at: string | null;
  max_uses: number | null;
  max_uses_per_user: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
};

export type CouponWrite = {
  code: string;
  kind: string;
  value: string | number;
  max_discount?: string | number | null;
  min_order_total?: string | number;
  starts_at?: string | null;
  ends_at?: string | null;
  max_uses?: number | null;
  max_uses_per_user?: number;
  is_active?: boolean;
};

export type CartItem = {
  id: number;
  quantity: number;
  line_total: string;
  buyable: boolean;
  product: Product;
};

export type CartCoupon = {
  id: number;
  code: string;
  kind?: string;
  value?: string;
};

export type Cart = {
  id: number;
  items: CartItem[];
  coupon: CartCoupon | null;
  coupon_error: { code?: string; detail?: string } | null;
  subtotal: string;
  discount_total: string;
  shipping_fee: string;
  total: string;
  requires_shipping: boolean;
};

export type ShippingAddress = {
  full_name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postal_code: string;
};

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled"
  | "refunded"
  | string;

export type OrderItem = {
  id: number;
  product: number;
  product_slug: string;
  title: string;
  kind: string;
  unit_price: string;
  quantity: number;
  line_total: string;
  has_digital_file: boolean;
};

export type ShopOrder = {
  id: number;
  number: string;
  status: OrderStatus;
  patient_name: string;
  requires_shipping: boolean;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_province: string;
  shipping_city: string;
  shipping_address: string;
  shipping_postal_code: string;
  subtotal: string;
  discount_total: string;
  shipping_fee: string;
  total: string;
  coupon_code: string;
  payment_ref: string;
  hold_expires_at: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  tracking_code: string;
  canceled_at: string | null;
  cancellation_reason: string;
  admin_note: string;
  items: OrderItem[];
  created_at: string;
};

export type ShopGatewayStart = {
  redirect_url: string;
  provider_ref: string;
  sandbox: boolean;
  payment_id: number;
  order: ShopOrder;
};

export type ShopStats = {
  revenue_total: string;
  orders_paid_count: number;
  revenue_7d: string;
  orders_7d: number;
  revenue_30d: string;
  orders_30d: number;
  orders_by_status: Record<string, number>;
  top_products: { title: string; quantity: number; revenue: string }[];
  recent_orders: ShopOrder[];
};
