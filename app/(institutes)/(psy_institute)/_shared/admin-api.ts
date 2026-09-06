import { apiClient } from "@/lib/api/client";
import type {
  AdminAppointmentSlot,
  AdminBookPayment,
  Appointment,
  AvailabilityException,
  AvailabilityWrite,
  ExceptionWrite,
  LeaveRequest,
  TherapistAvailability,
  TherapistReview,
  TherapistSessionOffer,
} from "./types";
import type {
  AdminOverview,
  AdminPatientDetail,
  AdminPatientSummary,
  AdminTherapistDetail,
  AdminTherapistSummary,
  AppointmentListFilters,
  FinanceLedgerRow,
  FinancePaymentRow,
  FinanceRevenueRow,
  FinanceSummary,
  Paginated,
} from "./admin-types";

function qs(params: Record<string, string | number | undefined | null>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const adminApi = {
  overview(): Promise<AdminOverview> {
    return apiClient.get("/psy/admin/overview/");
  },

  patients(params?: {
    q?: string;
    page?: number;
    page_size?: number;
  }): Promise<Paginated<AdminPatientSummary>> {
    return apiClient.get(`/psy/admin/patients/${qs(params ?? {})}`);
  },

  patient(id: number): Promise<AdminPatientDetail> {
    return apiClient.get(`/psy/admin/patients/${id}/`);
  },

  therapists(params?: {
    q?: string;
    is_active?: string;
    is_accepting_patients?: string;
    page?: number;
    page_size?: number;
  }): Promise<Paginated<AdminTherapistSummary>> {
    return apiClient.get(`/psy/admin/therapists/${qs(params ?? {})}`);
  },

  therapist(id: number): Promise<AdminTherapistDetail> {
    return apiClient.get(`/psy/admin/therapists/${id}/`);
  },

  appointments(
    filters: AppointmentListFilters = {},
  ): Promise<Paginated<Appointment>> {
    return apiClient.get(
      `/psy/appointments/${qs({
        page: filters.page ?? 1,
        page_size: filters.page_size ?? 25,
        therapist: filters.therapist,
        patient: filters.patient,
        status: filters.status,
        from: filters.from,
        to: filters.to,
      })}`,
    );
  },

  financeSummary(params?: {
    from?: string;
    to?: string;
  }): Promise<FinanceSummary> {
    return apiClient.get(`/psy/admin/finance/summary/${qs(params ?? {})}`);
  },

  financeLedger(params?: {
    entry_type?: string;
    user?: string;
    from?: string;
    to?: string;
    page?: number;
    page_size?: number;
  }): Promise<Paginated<FinanceLedgerRow>> {
    return apiClient.get(`/psy/admin/finance/ledger/${qs(params ?? {})}`);
  },

  financePayments(params?: {
    status?: string;
    provider?: string;
    from?: string;
    to?: string;
    page?: number;
    page_size?: number;
  }): Promise<Paginated<FinancePaymentRow>> {
    return apiClient.get(`/psy/admin/finance/payments/${qs(params ?? {})}`);
  },

  financeRevenue(params?: {
    from?: string;
    to?: string;
    entry_type?: string;
    page?: number;
    page_size?: number;
  }): Promise<Paginated<FinanceRevenueRow>> {
    return apiClient.get(
      `/psy/admin/finance/appointment-revenue/${qs(params ?? {})}`,
    );
  },

  therapistAvailability(therapistId: number): Promise<TherapistAvailability[]> {
    return apiClient.get(`/psy/admin/therapists/${therapistId}/availability/`);
  },

  createTherapistAvailability(
    therapistId: number,
    data: AvailabilityWrite,
  ): Promise<TherapistAvailability> {
    return apiClient.post(
      `/psy/admin/therapists/${therapistId}/availability/`,
      data,
    );
  },

  updateTherapistAvailability(
    therapistId: number,
    id: number,
    data: Partial<AvailabilityWrite>,
  ): Promise<TherapistAvailability> {
    return apiClient.patch(
      `/psy/admin/therapists/${therapistId}/availability/${id}/`,
      data,
    );
  },

  deleteTherapistAvailability(therapistId: number, id: number): Promise<void> {
    return apiClient.delete(
      `/psy/admin/therapists/${therapistId}/availability/${id}/`,
    );
  },

  therapistOffers(therapistId: number): Promise<TherapistSessionOffer[]> {
    return apiClient.get(
      `/psy/admin/therapists/${therapistId}/session-offers/`,
    );
  },

  createTherapistOffer(
    therapistId: number,
    data: { session_type_id: number; is_active?: boolean },
  ): Promise<TherapistSessionOffer> {
    return apiClient.post(
      `/psy/admin/therapists/${therapistId}/session-offers/`,
      data,
    );
  },

  updateTherapistOffer(
    therapistId: number,
    id: number,
    data: Partial<{ is_active: boolean; session_type_id: number }>,
  ): Promise<TherapistSessionOffer> {
    return apiClient.patch(
      `/psy/admin/therapists/${therapistId}/session-offers/${id}/`,
      data,
    );
  },

  deleteTherapistOffer(therapistId: number, id: number): Promise<void> {
    return apiClient.delete(
      `/psy/admin/therapists/${therapistId}/session-offers/${id}/`,
    );
  },

  therapistExceptions(therapistId: number): Promise<AvailabilityException[]> {
    return apiClient.get(`/psy/admin/therapists/${therapistId}/exceptions/`);
  },

  createTherapistException(
    therapistId: number,
    data: ExceptionWrite,
  ): Promise<AvailabilityException> {
    return apiClient.post(
      `/psy/admin/therapists/${therapistId}/exceptions/`,
      data,
    );
  },

  deleteTherapistException(therapistId: number, id: number): Promise<void> {
    return apiClient.delete(
      `/psy/admin/therapists/${therapistId}/exceptions/${id}/`,
    );
  },

  slots(params: {
    therapist?: number;
    from: string;
    to: string;
    status?: string;
  }): Promise<AdminAppointmentSlot[]> {
    return apiClient.get(`/psy/admin/slots/${qs(params)}`);
  },

  createSlot(data: {
    therapist_id: number;
    starts_at: string;
    ends_at: string;
  }): Promise<AdminAppointmentSlot> {
    return apiClient.post("/psy/admin/slots/", data);
  },

  deleteSlot(id: number): Promise<void> {
    return apiClient.delete(`/psy/admin/slots/${id}/`);
  },

  bookAppointment(data: {
    patient_id: number;
    slot_id: number;
    session_type_id: number;
    payment: AdminBookPayment;
  }): Promise<Appointment> {
    return apiClient.post("/psy/admin/appointments/", data);
  },

  leaveRequests(params?: {
    status?: string;
    therapist?: number;
  }): Promise<LeaveRequest[]> {
    return apiClient.get(`/psy/admin/leave-requests/${qs(params ?? {})}`);
  },

  approveLeaveRequest(
    id: number,
    adminNote = "",
  ): Promise<{
    leave_request: LeaveRequest;
    slots_created: number;
    conflicts: Appointment[];
  }> {
    return apiClient.post(`/psy/admin/leave-requests/${id}/approve/`, {
      admin_note: adminNote,
    });
  },

  rejectLeaveRequest(id: number, adminNote = ""): Promise<LeaveRequest> {
    return apiClient.post(`/psy/admin/leave-requests/${id}/reject/`, {
      admin_note: adminNote,
    });
  },

  reviews(params?: { status?: string }): Promise<TherapistReview[]> {
    return apiClient.get(`/psy/admin/reviews/${qs(params ?? {})}`);
  },

  approveReview(id: number, adminNote = ""): Promise<TherapistReview> {
    return apiClient.post(`/psy/admin/reviews/${id}/approve/`, {
      admin_note: adminNote,
    });
  },

  rejectReview(id: number, adminNote = ""): Promise<TherapistReview> {
    return apiClient.post(`/psy/admin/reviews/${id}/reject/`, {
      admin_note: adminNote,
    });
  },
};
