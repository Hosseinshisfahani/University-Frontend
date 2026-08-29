export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  date_joined: string;
  groups: string[];
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export type RegisterCredentials = {
  username: string;
  password: string;
  password_confirm: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
};

export type LoginResponse = {
  user: User;
};

export const PSY_PATIENT_GROUP = "psy_patient";
export const PSY_THERAPIST_GROUP = "psy_therapist";
export const PSY_ADMIN_GROUP = "psy_admin";

export function userHasGroup(user: User | null | undefined, group: string): boolean {
  return Boolean(user?.groups?.includes(group));
}

export function isPsyPatient(user: User | null | undefined): boolean {
  return userHasGroup(user, PSY_PATIENT_GROUP);
}

export function isPsyTherapist(user: User | null | undefined): boolean {
  return userHasGroup(user, PSY_THERAPIST_GROUP);
}

/** Matches backend IsPsyAdmin: psy_admin group or is_staff. */
export function isPsyAdmin(user: User | null | undefined): boolean {
  return Boolean(user?.is_staff) || userHasGroup(user, PSY_ADMIN_GROUP);
}

/** Role home inside the psychology institute, or null if the user has no portal. */
export function portalHomeForUser(user: User | null | undefined): string | null {
  if (!user) return null;
  if (isPsyAdmin(user)) return "/admin/overview";
  if (isPsyTherapist(user)) return "/therapist/overview";
  if (isPsyPatient(user)) return "/patient/overview";
  return null;
}

/** Whether this user may open an in-app portal path (`/admin`, `/therapist`, `/patient`). */
export function canAccessPortalPath(
  user: User | null | undefined,
  path: string,
): boolean {
  if (path.startsWith("/admin")) return isPsyAdmin(user);
  if (path.startsWith("/therapist")) return isPsyTherapist(user);
  if (path.startsWith("/patient")) return isPsyPatient(user);
  return false;
}
