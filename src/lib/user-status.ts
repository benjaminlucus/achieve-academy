/** Canonical user lifecycle statuses (MongoDB + API). */
export const USER_STATUSES = [
  "applied",
  "interview_scheduled",
  "verified",
  "blocked",
] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

/** Maps legacy DB values to the canonical enum. */
const LEGACY_STATUS_MAP: Record<string, UserStatus> = {
  reviewing: "applied",
  interview_pending: "applied",
  interview_live: "interview_scheduled",
  interview_completed: "interview_scheduled",
  approved: "verified",
  active: "applied",
  rejected: "blocked",
};

export function normalizeUserStatus(status: string | undefined | null): UserStatus {
  if (!status) return "applied";
  if ((USER_STATUSES as readonly string[]).includes(status)) {
    return status as UserStatus;
  }
  return LEGACY_STATUS_MAP[status] ?? "applied";
}

export function isVerifiedUserStatus(status: string): boolean {
  return normalizeUserStatus(status) === "verified";
}

export function isValidUserStatus(status: string): status is UserStatus {
  return (USER_STATUSES as readonly string[]).includes(status);
}
