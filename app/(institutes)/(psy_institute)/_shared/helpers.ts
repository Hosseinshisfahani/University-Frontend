export function appointmentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending_payment: "در انتظار پرداخت",
    confirmed: "تأیید شده",
    canceled_by_patient: "لغو توسط بیمار",
    canceled_by_therapist: "لغو توسط درمانگر",
    canceled_by_admin: "لغو توسط ادمین",
    completed: "انجام شده",
    no_show: "عدم حضور",
  };
  return map[status] ?? status;
}

export function isOpenAppointmentStatus(status: string): boolean {
  return status === "confirmed" || status === "pending_payment";
}

export function workshopEnrollmentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending_payment: "در انتظار پرداخت",
    active: "فعال",
    canceled: "لغو شده",
    refunded: "بازپرداخت شده",
  };
  return map[status] ?? status;
}

export function psychometricResponseStatusLabel(status: string): string {
  const map: Record<string, string> = {
    submitted: "ارسال‌شده",
    reviewed: "بررسی‌شده",
  };
  return map[status] ?? status;
}

export function sessionModalityLabel(modality: string): string {
  const map: Record<string, string> = {
    online: "آنلاین",
    in_person: "حضوری",
  };
  return map[modality] ?? modality;
}

export function refundPolicyLabel(policy: string): string {
  const map: Record<string, string> = {
    full_refund: "بازپرداخت کامل",
    forfeit: "ضبط وجه",
    none: "بدون بازپرداخت",
  };
  return map[policy] ?? policy;
}

export function slotStatusLabel(status: string): string {
  const map: Record<string, string> = {
    open: "خالی",
    held: "رزرو موقت",
    booked: "رزرو شده",
    blocked: "مسدود",
  };
  return map[status] ?? status;
}

export function leaveStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "در انتظار بررسی",
    approved: "تأیید شده",
    rejected: "رد شده",
    canceled: "لغو شده",
  };
  return map[status] ?? status;
}
