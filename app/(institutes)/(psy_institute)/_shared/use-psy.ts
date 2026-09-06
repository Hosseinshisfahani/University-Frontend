"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { financeKeys } from "@/features/finance/hooks";
import { psyApi } from "./api";
import type { AvailabilityWrite, ExceptionWrite, LeaveRequestWrite } from "./types";

export const psyKeys = {
  therapists: ["psy", "therapists"] as const,
  sessionTypes: ["psy", "session-types"] as const,
  slots: (therapistId: number, from?: string, to?: string, st?: number) =>
    ["psy", "slots", therapistId, from, to, st] as const,
  appointments: ["psy", "appointments"] as const,
  appointment: (id: number) => ["psy", "appointments", id] as const,
  notes: ["psy", "notes"] as const,
  forms: ["psy", "forms"] as const,
  form: (slug: string) => ["psy", "forms", slug] as const,
  responses: ["psy", "responses"] as const,
  response: (id: number) => ["psy", "responses", id] as const,
  availability: ["psy", "therapist", "availability"] as const,
  exceptions: ["psy", "therapist", "exceptions"] as const,
  offers: ["psy", "therapist", "offers"] as const,
  leaveRequests: ["psy", "therapist", "leave-requests"] as const,
  patients: ["psy", "therapist", "patients"] as const,
  patient: (id: number) => ["psy", "therapist", "patients", id] as const,
  workshops: (upcoming?: boolean) => ["psy", "workshops", upcoming] as const,
  workshop: (slug: string) => ["psy", "workshops", slug] as const,
  myWorkshopEnrollments: ["psy", "workshop-enrollments"] as const,
  therapistWorkshops: ["psy", "therapist", "workshops"] as const,
  therapistFinance: (start?: string, end?: string) =>
    ["psy", "therapist", "finance", start, end] as const,
  workshopRoster: (slug: string) => ["psy", "workshops", slug, "roster"] as const,
  blogPosts: (page?: number) => ["psy", "blog", page ?? 1] as const,
  blogPost: (slug: string) => ["psy", "blog", "detail", slug] as const,
  therapistPublicReviews: (id: number) =>
    ["psy", "therapists", id, "reviews"] as const,
  therapistReviews: ["psy", "therapist", "reviews"] as const,
};

export function useTherapists() {
  return useQuery({ queryKey: psyKeys.therapists, queryFn: () => psyApi.therapists() });
}

export function useSessionTypes() {
  return useQuery({
    queryKey: psyKeys.sessionTypes,
    queryFn: () => psyApi.sessionTypes(),
  });
}

export function useCreateSessionType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      modality: string;
      duration_minutes: number;
      price: string;
      buffer_minutes?: number;
    }) => psyApi.createSessionType({ ...data, is_active: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.sessionTypes });
    },
  });
}

export function useTherapistSlots(
  therapistId: number | null,
  params?: { from?: string; to?: string; session_type?: number },
) {
  return useQuery({
    queryKey: psyKeys.slots(
      therapistId ?? 0,
      params?.from,
      params?.to,
      params?.session_type,
    ),
    queryFn: () => psyApi.therapistSlots(therapistId!, params),
    enabled: Boolean(therapistId),
  });
}

export function useMyAppointments() {
  return useQuery({
    queryKey: psyKeys.appointments,
    queryFn: () => psyApi.appointments(),
  });
}

export function useAppointment(id: number) {
  return useQuery({
    queryKey: psyKeys.appointment(id),
    queryFn: () => psyApi.appointment(id),
    enabled: id > 0,
  });
}

export function useBookAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { slotId: number; sessionTypeId: number }) =>
      psyApi.bookAppointment(args.slotId, args.sessionTypeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.appointments });
    },
  });
}

export function useConfirmAppointmentPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: number;
      paymentRef: string;
      idempotencyKey: string;
    }) =>
      psyApi.confirmAppointmentPayment(
        args.id,
        args.paymentRef,
        args.idempotencyKey,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.appointments });
      qc.invalidateQueries({ queryKey: financeKeys.wallet });
      qc.invalidateQueries({ queryKey: ["finance", "ledger"] });
    },
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; reason?: string }) =>
      psyApi.cancelAppointment(args.id, args.reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.appointments });
      qc.invalidateQueries({ queryKey: financeKeys.wallet });
    },
  });
}

export function useCompleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => psyApi.completeAppointment(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: psyKeys.appointments });
      qc.invalidateQueries({ queryKey: psyKeys.appointment(id) });
      qc.invalidateQueries({ queryKey: ["psy-admin", "appointments"] });
    },
  });
}

export function useSubmitAppointmentReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; rating: number; body?: string }) =>
      psyApi.submitAppointmentReview(args.id, {
        rating: args.rating,
        body: args.body,
      }),
    onSuccess: (_data, args) => {
      qc.invalidateQueries({ queryKey: psyKeys.appointments });
      qc.invalidateQueries({ queryKey: psyKeys.appointment(args.id) });
      qc.invalidateQueries({ queryKey: psyKeys.therapists });
    },
  });
}

export function useTherapistPublicReviews(therapistId: number) {
  return useQuery({
    queryKey: psyKeys.therapistPublicReviews(therapistId),
    queryFn: () => psyApi.therapistPublicReviews(therapistId),
    enabled: therapistId > 0,
  });
}

export function useTherapistReviews() {
  return useQuery({
    queryKey: psyKeys.therapistReviews,
    queryFn: () => psyApi.therapistReviews(),
  });
}

export function useSharedNotes() {
  return useQuery({
    queryKey: psyKeys.notes,
    queryFn: () => psyApi.sessionNotes(),
  });
}

export function useSessionNotes() {
  return useQuery({
    queryKey: psyKeys.notes,
    queryFn: () => psyApi.sessionNotes(),
  });
}

export function useCreateSessionNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      appointment: number;
      body: string;
      shared_with_patient?: boolean;
    }) => psyApi.createSessionNote(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.notes });
    },
  });
}

export function useUpdateSessionNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: number;
      data: Partial<{ body: string; shared_with_patient: boolean }>;
    }) => psyApi.updateSessionNote(args.id, args.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.notes });
    },
  });
}

export function useDeleteSessionNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => psyApi.deleteSessionNote(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.notes });
    },
  });
}

export function usePsychometricForms() {
  return useQuery({
    queryKey: psyKeys.forms,
    queryFn: () => psyApi.psychometricForms(),
  });
}

export function usePsychometricForm(slug: string) {
  return useQuery({
    queryKey: psyKeys.form(slug),
    queryFn: () => psyApi.psychometricForm(slug),
    enabled: Boolean(slug),
  });
}

export function useSubmitPsychometric(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      answers: Record<string, unknown>;
      routedTherapistId?: number | null;
    }) => psyApi.submitPsychometric(slug, args.answers, args.routedTherapistId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.responses });
    },
  });
}

export function useMyPsychometricResponses() {
  return useQuery({
    queryKey: psyKeys.responses,
    queryFn: () => psyApi.psychometricResponses(),
  });
}

export function useRoutedPsychometricResponses() {
  return useQuery({
    queryKey: psyKeys.responses,
    queryFn: () => psyApi.psychometricResponses(),
  });
}

export function usePsychometricResponse(id: number) {
  return useQuery({
    queryKey: psyKeys.response(id),
    queryFn: () => psyApi.psychometricResponse(id),
    enabled: id > 0,
  });
}

export function useUpdatePsychometricResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; reviewer_notes: string }) =>
      psyApi.updatePsychometricResponse(args.id, {
        reviewer_notes: args.reviewer_notes,
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: psyKeys.responses });
      qc.invalidateQueries({ queryKey: psyKeys.response(vars.id) });
    },
  });
}

// --- Therapist schedule ---

export function useMyAvailability() {
  return useQuery({
    queryKey: psyKeys.availability,
    queryFn: () => psyApi.myAvailability(),
  });
}

export function useCreateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AvailabilityWrite) => psyApi.createAvailability(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.availability });
    },
  });
}

export function useUpdateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; data: Partial<AvailabilityWrite> }) =>
      psyApi.updateAvailability(args.id, args.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.availability });
    },
  });
}

export function useDeleteAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => psyApi.deleteAvailability(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.availability });
    },
  });
}

export function useMyExceptions() {
  return useQuery({
    queryKey: psyKeys.exceptions,
    queryFn: () => psyApi.myExceptions(),
  });
}

export function useCreateException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ExceptionWrite) => psyApi.createException(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.exceptions });
    },
  });
}

export function useUpdateException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; data: Partial<ExceptionWrite> }) =>
      psyApi.updateException(args.id, args.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.exceptions });
    },
  });
}

export function useDeleteException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => psyApi.deleteException(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.exceptions });
    },
  });
}

export function useMySessionOffers() {
  return useQuery({
    queryKey: psyKeys.offers,
    queryFn: () => psyApi.mySessionOffers(),
  });
}

export function useCreateSessionOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { session_type_id: number; is_active?: boolean }) =>
      psyApi.createSessionOffer(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.offers });
    },
  });
}

export function useUpdateSessionOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; is_active: boolean }) =>
      psyApi.updateSessionOffer(args.id, { is_active: args.is_active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.offers });
    },
  });
}

export function useDeleteSessionOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => psyApi.deleteSessionOffer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.offers });
    },
  });
}

export function useSetMeetingLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; meetingLink: string }) =>
      psyApi.setMeetingLink(args.id, args.meetingLink),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: psyKeys.appointments });
      qc.invalidateQueries({ queryKey: psyKeys.appointment(vars.id) });
    },
  });
}

export function useMyLeaveRequests() {
  return useQuery({
    queryKey: psyKeys.leaveRequests,
    queryFn: () => psyApi.myLeaveRequests(),
  });
}

export function useCreateLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LeaveRequestWrite) => psyApi.createLeaveRequest(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.leaveRequests });
    },
  });
}

export function useCancelLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => psyApi.cancelLeaveRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: psyKeys.leaveRequests });
    },
  });
}

export function useMyPatients() {
  return useQuery({
    queryKey: psyKeys.patients,
    queryFn: () => psyApi.myPatients(),
  });
}

export function useMyPatient(id: number) {
  return useQuery({
    queryKey: psyKeys.patient(id),
    queryFn: () => psyApi.myPatient(id),
    enabled: id > 0,
  });
}

export function useWorkshops(upcoming = false) {
  return useQuery({
    queryKey: psyKeys.workshops(upcoming),
    queryFn: () => psyApi.workshops({ upcoming }),
  });
}

export function useWorkshop(slug: string) {
  return useQuery({
    queryKey: psyKeys.workshop(slug),
    queryFn: () => psyApi.workshop(slug),
    enabled: Boolean(slug),
  });
}

export function useMyWorkshopEnrollments() {
  return useQuery({
    queryKey: psyKeys.myWorkshopEnrollments,
    queryFn: () => psyApi.myWorkshopEnrollments(),
  });
}

export function useTherapistWorkshops() {
  return useQuery({
    queryKey: psyKeys.therapistWorkshops,
    queryFn: () => psyApi.therapistWorkshops(),
  });
}

export function useTherapistFinance(startDate: string, endDate: string) {
  return useQuery({
    queryKey: psyKeys.therapistFinance(startDate, endDate),
    queryFn: () =>
      psyApi.therapistFinance({ start_date: startDate, end_date: endDate }),
    enabled: Boolean(startDate && endDate),
  });
}

export function useWorkshopRoster(slug: string) {
  return useQuery({
    queryKey: psyKeys.workshopRoster(slug),
    queryFn: () => psyApi.workshopRoster(slug),
    enabled: Boolean(slug),
  });
}

export function useEnrollWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => psyApi.enrollWorkshop(slug),
    onSuccess: (_data, slug) => {
      qc.invalidateQueries({ queryKey: psyKeys.workshop(slug) });
      qc.invalidateQueries({ queryKey: psyKeys.workshops() });
      qc.invalidateQueries({ queryKey: psyKeys.myWorkshopEnrollments });
    },
  });
}

export function useConfirmWorkshopEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      slug: string;
      enrollmentId: number;
      paymentRef: string;
      idempotencyKey: string;
    }) =>
      psyApi.confirmWorkshopEnrollment(
        vars.slug,
        vars.enrollmentId,
        vars.paymentRef,
        vars.idempotencyKey,
      ),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: psyKeys.workshop(vars.slug) });
      qc.invalidateQueries({ queryKey: psyKeys.myWorkshopEnrollments });
      qc.invalidateQueries({ queryKey: financeKeys.wallet });
    },
  });
}

export function useCancelWorkshopEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { slug: string; enrollmentId: number; reason?: string }) =>
      psyApi.cancelWorkshopEnrollment(
        vars.slug,
        vars.enrollmentId,
        vars.reason ?? "",
      ),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: psyKeys.workshop(vars.slug) });
      qc.invalidateQueries({ queryKey: psyKeys.workshopRoster(vars.slug) });
      qc.invalidateQueries({ queryKey: psyKeys.myWorkshopEnrollments });
      qc.invalidateQueries({ queryKey: psyKeys.workshops() });
      qc.invalidateQueries({ queryKey: financeKeys.wallet });
    },
  });
}

export function useCreateWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: psyApi.createWorkshop,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["psy", "workshops"] });
    },
  });
}

export function useUpdateWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { slug: string; data: Parameters<typeof psyApi.updateWorkshop>[1] }) =>
      psyApi.updateWorkshop(vars.slug, vars.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: psyKeys.workshop(vars.slug) });
      qc.invalidateQueries({ queryKey: ["psy", "workshops"] });
    },
  });
}

export function useDeleteWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => psyApi.deleteWorkshop(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["psy", "workshops"] });
    },
  });
}

export function useWorkshopSessionsAdmin(slug: string) {
  return useQuery({
    queryKey: ["psy", "workshops", slug, "sessions-admin"] as const,
    queryFn: () => psyApi.workshopSessions(slug),
    enabled: Boolean(slug),
  });
}

export function useWorkshopResourcesAdmin(slug: string) {
  return useQuery({
    queryKey: ["psy", "workshops", slug, "resources-admin"] as const,
    queryFn: () => psyApi.workshopResources(slug),
    enabled: Boolean(slug),
  });
}

export function useCompleteWorkshopSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { slug: string; sessionId: number }) =>
      psyApi.completeWorkshopSession(vars.slug, vars.sessionId),
    onSuccess: (data) => {
      qc.setQueryData(psyKeys.workshop(data.slug), data);
      qc.invalidateQueries({ queryKey: psyKeys.workshop(data.slug) });
    },
  });
}

export function useIssueWorkshopCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => psyApi.issueWorkshopCertificate(slug),
    onSuccess: (_data, slug) => {
      qc.invalidateQueries({ queryKey: psyKeys.workshop(slug) });
    },
  });
}

export function useBlogPosts(page = 1) {
  return useQuery({
    queryKey: psyKeys.blogPosts(page),
    queryFn: () => psyApi.blogPosts({ page }),
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: psyKeys.blogPost(slug),
    queryFn: () => psyApi.blogPost(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: psyApi.createBlogPost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["psy", "blog"] });
    },
  });
}

export function useUpdateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      slug: string;
      data: Parameters<typeof psyApi.updateBlogPost>[1];
    }) => psyApi.updateBlogPost(vars.slug, vars.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: psyKeys.blogPost(vars.slug) });
      qc.invalidateQueries({ queryKey: ["psy", "blog"] });
    },
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => psyApi.deleteBlogPost(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["psy", "blog"] });
    },
  });
}
