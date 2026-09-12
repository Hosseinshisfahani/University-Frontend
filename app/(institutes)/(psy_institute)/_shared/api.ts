import { apiClient } from "@/lib/api/client";
import type {
  Appointment,
  AppointmentSlot,
  AvailabilityException,
  AvailabilityWrite,
  ExceptionWrite,
  LeaveRequest,
  LeaveRequestWrite,
  ClinicalReport,
  ClinicalReportWrite,
  FileAccessRequest,
  MissingReportsPayload,
  PsychometricForm,
  PsychometricResponse,
  SessionNote,
  SessionType,
  Therapist,
  TherapistAvailability,
  TherapistPatientDetail,
  TherapistPatientSummary,
  TherapistSessionOffer,
  Workshop,
  WorkshopCertificate,
  WorkshopEnrollment,
  WorkshopResourceWrite,
  WorkshopSessionWrite,
  WorkshopWrite,
  BlogPost,
  BlogPostPage,
  BlogPostWrite,
  NewsSlide,
  NewsSlideWrite,
  TherapistFinanceReport,
  TherapistReview,
  PublicTherapistReview,
} from "./types";

export const psyApi = {
  therapists(): Promise<Therapist[]> {
    return apiClient.get("/psy/therapists/");
  },

  therapistSlots(
    therapistId: number,
    params?: { from?: string; to?: string; session_type?: number },
  ): Promise<AppointmentSlot[]> {
    const q = new URLSearchParams();
    if (params?.from) q.set("from", params.from);
    if (params?.to) q.set("to", params.to);
    if (params?.session_type) q.set("session_type", String(params.session_type));
    const qs = q.toString();
    const path = qs
      ? `/psy/therapists/${therapistId}/slots/?${qs}`
      : `/psy/therapists/${therapistId}/slots/`;
    return apiClient.get(path);
  },

  sessionTypes(): Promise<SessionType[]> {
    return apiClient.get("/psy/session-types/");
  },

  createSessionType(data: {
    name: string;
    modality: string;
    duration_minutes: number;
    price: string;
    buffer_minutes?: number;
    is_active?: boolean;
  }): Promise<SessionType> {
    return apiClient.post("/psy/session-types/", data);
  },

  appointments(): Promise<Appointment[]> {
    return apiClient.get("/psy/appointments/");
  },

  appointment(id: number): Promise<Appointment> {
    return apiClient.get(`/psy/appointments/${id}/`);
  },

  bookAppointment(slotId: number, sessionTypeId: number): Promise<Appointment> {
    return apiClient.post("/psy/appointments/", {
      slot_id: slotId,
      session_type_id: sessionTypeId,
    });
  },

  confirmAppointmentPayment(
    id: number,
    paymentRef: string,
    idempotencyKey: string,
  ): Promise<Appointment> {
    return apiClient.post(`/psy/appointments/${id}/confirm_payment/`, {
      payment_ref: paymentRef,
      idempotency_key: idempotencyKey,
    });
  },

  cancelAppointment(id: number, reason = ""): Promise<Appointment> {
    return apiClient.post(`/psy/appointments/${id}/cancel/`, { reason });
  },

  completeAppointment(id: number): Promise<Appointment> {
    return apiClient.post(`/psy/appointments/${id}/complete/`, {});
  },

  submitAppointmentReview(
    id: number,
    data: { rating: number; body?: string },
  ): Promise<TherapistReview> {
    return apiClient.post(`/psy/appointments/${id}/review/`, data);
  },

  therapistPublicReviews(therapistId: number): Promise<PublicTherapistReview[]> {
    return apiClient.get(`/psy/therapists/${therapistId}/reviews/`);
  },

  therapistReviews(): Promise<TherapistReview[]> {
    return apiClient.get("/psy/therapist/reviews/");
  },

  moveAppointment(id: number, newSlotId: number): Promise<Appointment> {
    return apiClient.post(`/psy/appointments/${id}/move/`, {
      new_slot_id: newSlotId,
    });
  },

  regenerateSlots(data: {
    therapist_id: number;
    range_start: string;
    range_end: string;
  }): Promise<{ created: number }> {
    return apiClient.post("/psy/slots/regenerate/", data);
  },

  sessionNotes(): Promise<SessionNote[]> {
    return apiClient.get("/psy/session-notes/");
  },

  createSessionNote(data: {
    appointment: number;
    body: string;
    shared_with_patient?: boolean;
  }): Promise<SessionNote> {
    return apiClient.post("/psy/session-notes/", data);
  },

  updateSessionNote(
    id: number,
    data: Partial<{ body: string; shared_with_patient: boolean }>,
  ): Promise<SessionNote> {
    return apiClient.patch(`/psy/session-notes/${id}/`, data);
  },

  deleteSessionNote(id: number): Promise<void> {
    return apiClient.delete(`/psy/session-notes/${id}/`);
  },

  clinicalReports(): Promise<ClinicalReport[]> {
    return apiClient.get("/psy/clinical-reports/");
  },

  createClinicalReport(data: ClinicalReportWrite): Promise<ClinicalReport> {
    return apiClient.post("/psy/clinical-reports/", data);
  },

  updateClinicalReport(
    id: number,
    data: Partial<Omit<ClinicalReportWrite, "appointment">>,
  ): Promise<ClinicalReport> {
    return apiClient.patch(`/psy/clinical-reports/${id}/`, data);
  },

  missingReports(): Promise<MissingReportsPayload> {
    return apiClient.get("/psy/clinical-reports/missing/");
  },

  fileAccessRequests(params?: { status?: string }): Promise<FileAccessRequest[]> {
    const q = params?.status ? `?status=${encodeURIComponent(params.status)}` : "";
    return apiClient.get(`/psy/file-access-requests/${q}`);
  },

  createFileAccessRequest(data: {
    patient: number;
    reason?: string;
  }): Promise<FileAccessRequest> {
    return apiClient.post("/psy/file-access-requests/", data);
  },

  psychometricForms(): Promise<PsychometricForm[]> {
    return apiClient.get("/psy/psychometric-forms/");
  },

  psychometricForm(slug: string): Promise<PsychometricForm> {
    return apiClient.get(`/psy/psychometric-forms/${slug}/`);
  },

  submitPsychometric(
    slug: string,
    answers: Record<string, unknown>,
    routedTherapistId?: number | null,
  ): Promise<PsychometricResponse> {
    return apiClient.post(`/psy/psychometric-forms/${slug}/submit/`, {
      answers,
      routed_therapist_id: routedTherapistId ?? null,
    });
  },

  psychometricResponses(): Promise<PsychometricResponse[]> {
    return apiClient.get("/psy/psychometric-responses/");
  },

  psychometricResponse(id: number): Promise<PsychometricResponse> {
    return apiClient.get(`/psy/psychometric-responses/${id}/`);
  },

  updatePsychometricResponse(
    id: number,
    data: Partial<{ reviewer_notes: string }>,
  ): Promise<PsychometricResponse> {
    return apiClient.patch(`/psy/psychometric-responses/${id}/`, data);
  },

  // --- Therapist schedule ---

  myAvailability(): Promise<TherapistAvailability[]> {
    return apiClient.get("/psy/therapist/availability/");
  },

  createAvailability(data: AvailabilityWrite): Promise<TherapistAvailability> {
    return apiClient.post("/psy/therapist/availability/", data);
  },

  updateAvailability(
    id: number,
    data: Partial<AvailabilityWrite>,
  ): Promise<TherapistAvailability> {
    return apiClient.patch(`/psy/therapist/availability/${id}/`, data);
  },

  deleteAvailability(id: number): Promise<void> {
    return apiClient.delete(`/psy/therapist/availability/${id}/`);
  },

  myExceptions(): Promise<AvailabilityException[]> {
    return apiClient.get("/psy/therapist/exceptions/");
  },

  createException(data: ExceptionWrite): Promise<AvailabilityException> {
    return apiClient.post("/psy/therapist/exceptions/", data);
  },

  updateException(
    id: number,
    data: Partial<ExceptionWrite>,
  ): Promise<AvailabilityException> {
    return apiClient.patch(`/psy/therapist/exceptions/${id}/`, data);
  },

  deleteException(id: number): Promise<void> {
    return apiClient.delete(`/psy/therapist/exceptions/${id}/`);
  },

  mySessionOffers(): Promise<TherapistSessionOffer[]> {
    return apiClient.get("/psy/therapist/session-offers/");
  },

  createSessionOffer(data: {
    session_type_id: number;
    is_active?: boolean;
  }): Promise<TherapistSessionOffer> {
    return apiClient.post("/psy/therapist/session-offers/", data);
  },

  updateSessionOffer(
    id: number,
    data: Partial<{ is_active: boolean; session_type_id: number }>,
  ): Promise<TherapistSessionOffer> {
    return apiClient.patch(`/psy/therapist/session-offers/${id}/`, data);
  },

  deleteSessionOffer(id: number): Promise<void> {
    return apiClient.delete(`/psy/therapist/session-offers/${id}/`);
  },

  setMeetingLink(id: number, meetingLink: string): Promise<Appointment> {
    return apiClient.post(`/psy/appointments/${id}/set_meeting_link/`, {
      meeting_link: meetingLink,
    });
  },

  myPatients(): Promise<TherapistPatientSummary[]> {
    return apiClient.get("/psy/therapist/patients/");
  },

  myPatient(id: number): Promise<TherapistPatientDetail> {
    return apiClient.get(`/psy/therapist/patients/${id}/`);
  },

  myLeaveRequests(): Promise<LeaveRequest[]> {
    return apiClient.get("/psy/therapist/leave-requests/");
  },

  createLeaveRequest(data: LeaveRequestWrite): Promise<LeaveRequest> {
    return apiClient.post("/psy/therapist/leave-requests/", data);
  },

  cancelLeaveRequest(id: number): Promise<LeaveRequest> {
    return apiClient.post(`/psy/therapist/leave-requests/${id}/cancel/`, {});
  },

  workshops(params?: { upcoming?: boolean }): Promise<Workshop[]> {
    const q = params?.upcoming ? "?upcoming=1" : "";
    return apiClient.get(`/psy/workshops/${q}`);
  },

  workshop(slug: string): Promise<Workshop> {
    return apiClient.get(`/psy/workshops/${slug}/`);
  },

  createWorkshop(data: WorkshopWrite | FormData): Promise<Workshop> {
    return apiClient.post("/psy/workshops/", data);
  },

  updateWorkshop(
    slug: string,
    data: Partial<WorkshopWrite> | FormData,
  ): Promise<Workshop> {
    return apiClient.patch(`/psy/workshops/${slug}/`, data);
  },

  deleteWorkshop(slug: string): Promise<void> {
    return apiClient.delete(`/psy/workshops/${slug}/`);
  },

  enrollWorkshop(slug: string): Promise<WorkshopEnrollment> {
    return apiClient.post(`/psy/workshops/${slug}/enroll/`, {});
  },

  confirmWorkshopEnrollment(
    slug: string,
    enrollmentId: number,
    paymentRef: string,
    idempotencyKey: string,
  ): Promise<WorkshopEnrollment> {
    return apiClient.post(
      `/psy/workshops/${slug}/enrollments/${enrollmentId}/confirm/`,
      { payment_ref: paymentRef, idempotency_key: idempotencyKey },
    );
  },

  cancelWorkshopEnrollment(
    slug: string,
    enrollmentId: number,
    reason = "",
  ): Promise<WorkshopEnrollment> {
    return apiClient.post(
      `/psy/workshops/${slug}/enrollments/${enrollmentId}/cancel/`,
      { reason },
    );
  },

  workshopRoster(slug: string): Promise<WorkshopEnrollment[]> {
    return apiClient.get(`/psy/workshops/${slug}/roster/`);
  },

  myWorkshopEnrollments(): Promise<WorkshopEnrollment[]> {
    return apiClient.get("/psy/patient/workshop-enrollments/");
  },

  therapistWorkshops(): Promise<Workshop[]> {
    return apiClient.get("/psy/therapist/workshops/");
  },

  therapistFinance(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<TherapistFinanceReport> {
    const q = new URLSearchParams();
    if (params?.start_date) q.set("start_date", params.start_date);
    if (params?.end_date) q.set("end_date", params.end_date);
    const qs = q.toString();
    return apiClient.get(`/psy/therapist/finance/${qs ? `?${qs}` : ""}`);
  },

  workshopSessions(slug: string): Promise<WorkshopSessionWrite[]> {
    return apiClient.get(`/psy/workshops/${slug}/sessions/`);
  },

  createWorkshopSession(
    slug: string,
    data: WorkshopSessionWrite,
  ): Promise<WorkshopSessionWrite> {
    return apiClient.post(`/psy/workshops/${slug}/sessions/`, data);
  },

  updateWorkshopSession(
    slug: string,
    id: number,
    data: Partial<WorkshopSessionWrite>,
  ): Promise<WorkshopSessionWrite> {
    return apiClient.patch(`/psy/workshops/${slug}/sessions/${id}/`, data);
  },

  deleteWorkshopSession(slug: string, id: number): Promise<void> {
    return apiClient.delete(`/psy/workshops/${slug}/sessions/${id}/`);
  },

  workshopResources(slug: string): Promise<WorkshopResourceWrite[]> {
    return apiClient.get(`/psy/workshops/${slug}/resources/`);
  },

  createWorkshopResource(
    slug: string,
    data: WorkshopResourceWrite,
  ): Promise<WorkshopResourceWrite> {
    return apiClient.post(`/psy/workshops/${slug}/resources/`, data);
  },

  updateWorkshopResource(
    slug: string,
    id: number,
    data: Partial<WorkshopResourceWrite>,
  ): Promise<WorkshopResourceWrite> {
    return apiClient.patch(`/psy/workshops/${slug}/resources/${id}/`, data);
  },

  deleteWorkshopResource(slug: string, id: number): Promise<void> {
    return apiClient.delete(`/psy/workshops/${slug}/resources/${id}/`);
  },

  completeWorkshopSession(slug: string, sessionId: number): Promise<Workshop> {
    return apiClient.post(
      `/psy/workshops/${slug}/sessions/${sessionId}/complete/`,
      {},
    );
  },

  issueWorkshopCertificate(slug: string): Promise<WorkshopCertificate> {
    return apiClient.post(`/psy/workshops/${slug}/certificate/issue/`, {});
  },

  getWorkshopCertificate(slug: string): Promise<WorkshopCertificate> {
    return apiClient.get(`/psy/workshops/${slug}/certificate/`);
  },

  blogPosts(params?: { page?: number }): Promise<BlogPostPage> {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    const qs = q.toString();
    return apiClient.get(`/psy/blog/${qs ? `?${qs}` : ""}`);
  },

  blogPost(slug: string): Promise<BlogPost> {
    return apiClient.get(`/psy/blog/${slug}/`);
  },

  createBlogPost(data: BlogPostWrite | FormData): Promise<BlogPost> {
    return apiClient.post("/psy/blog/", data);
  },

  updateBlogPost(
    slug: string,
    data: Partial<BlogPostWrite> | FormData,
  ): Promise<BlogPost> {
    return apiClient.patch(`/psy/blog/${slug}/`, data);
  },

  deleteBlogPost(slug: string): Promise<void> {
    return apiClient.delete(`/psy/blog/${slug}/`);
  },

  newsSlides(): Promise<NewsSlide[]> {
    return apiClient.get("/psy/news/");
  },

  newsSlide(id: number): Promise<NewsSlide> {
    return apiClient.get(`/psy/news/${id}/`);
  },

  createNewsSlide(data: NewsSlideWrite | FormData): Promise<NewsSlide> {
    return apiClient.post("/psy/news/", data);
  },

  updateNewsSlide(
    id: number,
    data: Partial<NewsSlideWrite> | FormData,
  ): Promise<NewsSlide> {
    return apiClient.patch(`/psy/news/${id}/`, data);
  },

  deleteNewsSlide(id: number): Promise<void> {
    return apiClient.delete(`/psy/news/${id}/`);
  },
};
