"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import { isPsyAdmin } from "@/features/auth/types";
import { psyApi } from "./api";
import { psyKeys } from "./use-psy";
import { adminApi } from "./admin-api";
import type { AppointmentListFilters } from "./admin-types";
import type {
  AdminBookPayment,
  AvailabilityWrite,
  ExceptionWrite,
} from "./types";

function useAdminQueriesEnabled(extra = true): boolean {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);
  return extra && isHydrated && isPsyAdmin(user);
}

export const adminKeys = {
  overview: ["psy-admin", "overview"] as const,
  patients: (q?: string, page?: number) =>
    ["psy-admin", "patients", q, page] as const,
  patient: (id: number) => ["psy-admin", "patients", id] as const,
  therapists: (params: Record<string, unknown>) =>
    ["psy-admin", "therapists", params] as const,
  therapist: (id: number) => ["psy-admin", "therapists", id] as const,
  appointments: (filters: AppointmentListFilters) =>
    ["psy-admin", "appointments", filters] as const,
  financeSummary: (from?: string, to?: string) =>
    ["psy-admin", "finance", "summary", from, to] as const,
  financeLedger: (params: Record<string, unknown>) =>
    ["psy-admin", "finance", "ledger", params] as const,
  financePayments: (params: Record<string, unknown>) =>
    ["psy-admin", "finance", "payments", params] as const,
  financeRevenue: (params: Record<string, unknown>) =>
    ["psy-admin", "finance", "revenue", params] as const,
  reviews: (status?: string) => ["psy-admin", "reviews", status] as const,
};

export function useAdminOverview() {
  return useQuery({
    queryKey: adminKeys.overview,
    queryFn: () => adminApi.overview(),
    enabled: useAdminQueriesEnabled(),
  });
}

export function useAdminPatients(q: string, page: number) {
  return useQuery({
    queryKey: adminKeys.patients(q, page),
    queryFn: () => adminApi.patients({ q: q || undefined, page, page_size: 25 }),
    enabled: useAdminQueriesEnabled(),
  });
}

export function useAdminPatient(id: number) {
  return useQuery({
    queryKey: adminKeys.patient(id),
    queryFn: () => adminApi.patient(id),
    enabled: useAdminQueriesEnabled(id > 0),
  });
}

export function useAdminTherapists(params: {
  q?: string;
  is_active?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: adminKeys.therapists(params),
    queryFn: () =>
      adminApi.therapists({
        q: params.q || undefined,
        is_active: params.is_active,
        page: params.page ?? 1,
        page_size: 25,
      }),
    enabled: useAdminQueriesEnabled(),
  });
}

export function useAdminTherapist(id: number) {
  return useQuery({
    queryKey: adminKeys.therapist(id),
    queryFn: () => adminApi.therapist(id),
    enabled: useAdminQueriesEnabled(id > 0),
  });
}

export function useAdminAppointments(filters: AppointmentListFilters) {
  return useQuery({
    queryKey: adminKeys.appointments(filters),
    queryFn: () => adminApi.appointments(filters),
    enabled: useAdminQueriesEnabled(),
  });
}

export function useAdminCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      psyApi.cancelAppointment(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["psy-admin", "appointments"] });
      qc.invalidateQueries({ queryKey: adminKeys.overview });
      qc.invalidateQueries({ queryKey: psyKeys.appointments });
    },
  });
}

export function useAdminMoveAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newSlotId }: { id: number; newSlotId: number }) =>
      psyApi.moveAppointment(id, newSlotId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["psy-admin", "appointments"] });
      qc.invalidateQueries({ queryKey: adminKeys.overview });
    },
  });
}

export function useRegenerateSlots() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      therapist_id: number;
      range_start: string;
      range_end: string;
    }) => psyApi.regenerateSlots(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["psy-admin", "therapists"] });
      qc.invalidateQueries({ queryKey: ["psy-admin", "slots"] });
      qc.invalidateQueries({ queryKey: adminKeys.overview });
    },
  });
}

export const adminScheduleKeys = {
  slots: (params: Record<string, unknown>) =>
    ["psy-admin", "slots", params] as const,
  availability: (therapistId: number) =>
    ["psy-admin", "availability", therapistId] as const,
  offers: (therapistId: number) => ["psy-admin", "offers", therapistId] as const,
  exceptions: (therapistId: number) =>
    ["psy-admin", "exceptions", therapistId] as const,
  leave: (status?: string) => ["psy-admin", "leave", status] as const,
};

export function useAdminSlots(params: {
  therapist?: number;
  from: string;
  to: string;
  status?: string;
  enabled?: boolean;
}) {
  const { enabled = true, ...query } = params;
  return useQuery({
    queryKey: adminScheduleKeys.slots(query),
    queryFn: () => adminApi.slots(query),
    enabled: useAdminQueriesEnabled(enabled && Boolean(query.from && query.to)),
  });
}

export function useCreateAdminSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      therapist_id: number;
      starts_at: string;
      ends_at: string;
    }) => adminApi.createSlot(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["psy-admin", "slots"] });
      qc.invalidateQueries({ queryKey: ["psy-admin", "therapists"] });
    },
  });
}

export function useDeleteAdminSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteSlot(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["psy-admin", "slots"] });
      qc.invalidateQueries({ queryKey: ["psy-admin", "therapists"] });
    },
  });
}

export function useAdminTherapistAvailability(therapistId: number) {
  return useQuery({
    queryKey: adminScheduleKeys.availability(therapistId),
    queryFn: () => adminApi.therapistAvailability(therapistId),
    enabled: useAdminQueriesEnabled(therapistId > 0),
  });
}

export function useCreateAdminAvailability(therapistId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AvailabilityWrite) =>
      adminApi.createTherapistAvailability(therapistId, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: adminScheduleKeys.availability(therapistId),
      });
    },
  });
}

export function useDeleteAdminAvailability(therapistId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      adminApi.deleteTherapistAvailability(therapistId, id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: adminScheduleKeys.availability(therapistId),
      });
    },
  });
}

export function useAdminTherapistOffers(therapistId: number) {
  return useQuery({
    queryKey: adminScheduleKeys.offers(therapistId),
    queryFn: () => adminApi.therapistOffers(therapistId),
    enabled: useAdminQueriesEnabled(therapistId > 0),
  });
}

export function useCreateAdminOffer(therapistId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { session_type_id: number; is_active?: boolean }) =>
      adminApi.createTherapistOffer(therapistId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminScheduleKeys.offers(therapistId) });
    },
  });
}

export function useUpdateAdminOffer(therapistId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; is_active: boolean }) =>
      adminApi.updateTherapistOffer(therapistId, args.id, {
        is_active: args.is_active,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminScheduleKeys.offers(therapistId) });
    },
  });
}

export function useDeleteAdminOffer(therapistId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteTherapistOffer(therapistId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminScheduleKeys.offers(therapistId) });
    },
  });
}

export function useAdminTherapistExceptions(therapistId: number) {
  return useQuery({
    queryKey: adminScheduleKeys.exceptions(therapistId),
    queryFn: () => adminApi.therapistExceptions(therapistId),
    enabled: useAdminQueriesEnabled(therapistId > 0),
  });
}

export function useCreateAdminException(therapistId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ExceptionWrite) =>
      adminApi.createTherapistException(therapistId, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: adminScheduleKeys.exceptions(therapistId),
      });
    },
  });
}

export function useDeleteAdminException(therapistId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      adminApi.deleteTherapistException(therapistId, id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: adminScheduleKeys.exceptions(therapistId),
      });
    },
  });
}

export function useAdminBookAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      patient_id: number;
      slot_id: number;
      session_type_id: number;
      payment: AdminBookPayment;
    }) => adminApi.bookAppointment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["psy-admin", "appointments"] });
      qc.invalidateQueries({ queryKey: ["psy-admin", "slots"] });
      qc.invalidateQueries({ queryKey: adminKeys.overview });
      qc.invalidateQueries({ queryKey: psyKeys.appointments });
    },
  });
}

export function useAdminLeaveRequests(status?: string) {
  return useQuery({
    queryKey: adminScheduleKeys.leave(status),
    queryFn: () => adminApi.leaveRequests({ status: status || undefined }),
    enabled: useAdminQueriesEnabled(),
  });
}

export function useApproveLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; adminNote?: string }) =>
      adminApi.approveLeaveRequest(args.id, args.adminNote ?? ""),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["psy-admin", "leave"] });
      qc.invalidateQueries({ queryKey: ["psy-admin", "slots"] });
      qc.invalidateQueries({ queryKey: ["psy-admin", "appointments"] });
    },
  });
}

export function useRejectLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; adminNote?: string }) =>
      adminApi.rejectLeaveRequest(args.id, args.adminNote ?? ""),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["psy-admin", "leave"] });
    },
  });
}

export function useAdminReviews(status?: string) {
  return useQuery({
    queryKey: adminKeys.reviews(status),
    queryFn: () => adminApi.reviews({ status }),
    enabled: useAdminQueriesEnabled(),
  });
}

export function useApproveReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; adminNote?: string }) =>
      adminApi.approveReview(args.id, args.adminNote ?? ""),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["psy-admin", "reviews"] });
      qc.invalidateQueries({ queryKey: adminKeys.overview });
      qc.invalidateQueries({ queryKey: psyKeys.therapists });
    },
  });
}

export function useRejectReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; adminNote?: string }) =>
      adminApi.rejectReview(args.id, args.adminNote ?? ""),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["psy-admin", "reviews"] });
      qc.invalidateQueries({ queryKey: adminKeys.overview });
    },
  });
}

export function useFinanceSummary(from?: string, to?: string) {
  return useQuery({
    queryKey: adminKeys.financeSummary(from, to),
    queryFn: () => adminApi.financeSummary({ from, to }),
    enabled: useAdminQueriesEnabled(),
  });
}

export function useFinanceLedger(params: {
  entry_type?: string;
  user?: string;
  from?: string;
  to?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: adminKeys.financeLedger(params),
    queryFn: () => adminApi.financeLedger(params),
    enabled: useAdminQueriesEnabled(),
  });
}

export function useFinancePayments(params: {
  status?: string;
  provider?: string;
  from?: string;
  to?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: adminKeys.financePayments(params),
    queryFn: () => adminApi.financePayments(params),
    enabled: useAdminQueriesEnabled(),
  });
}

export function useFinanceRevenue(params: {
  from?: string;
  to?: string;
  entry_type?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: adminKeys.financeRevenue(params),
    queryFn: () => adminApi.financeRevenue(params),
    enabled: useAdminQueriesEnabled(),
  });
}
