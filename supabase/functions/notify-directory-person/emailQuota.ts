export const EMAIL_DAY_LIMIT = 50;
export const EMAIL_MONTH_LIMIT = 1000;
export const EMAIL_QUOTA_TIMEZONE = "Pacific/Auckland";

export type EmailQuotaHit = "day" | "month" | "both" | null;

export type EmailQuotaStatus = {
  timezone: string;
  day_limit: number;
  month_limit: number;
  day_count: number;
  month_count: number;
  day_remaining: number;
  month_remaining: number;
  blocked: boolean;
  hit: EmailQuotaHit;
};

export function emailQuotaBlockedMessage(
  status: Pick<EmailQuotaStatus, "hit" | "day_limit" | "month_limit">,
): string {
  if (status.hit === "month") {
    return `The church monthly email limit of ${status.month_limit.toLocaleString("en-NZ")} has been reached. Sending resumes at the start of next month, New Zealand time.`;
  }
  if (status.hit === "both") {
    return `The church email limits have been reached (${status.day_limit} per day and ${status.month_limit.toLocaleString("en-NZ")} per month). Sending resumes at midnight New Zealand time, or the start of next month if the monthly limit is still full.`;
  }
  return `The church daily email limit of ${status.day_limit} has been reached. Sending resumes at midnight New Zealand time.`;
}

function asInt(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : fallback;
}

function parseHit(value: unknown): EmailQuotaHit {
  if (value === "day" || value === "month" || value === "both") return value;
  return null;
}

export function parseEmailQuotaStatus(raw: unknown): EmailQuotaStatus {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const dayLimit = asInt(row.day_limit, EMAIL_DAY_LIMIT);
  const monthLimit = asInt(row.month_limit, EMAIL_MONTH_LIMIT);
  const dayCount = asInt(row.day_count, 0);
  const monthCount = asInt(row.month_count, 0);
  const hit = parseHit(row.hit);
  const blocked = Boolean(row.blocked) || dayCount >= dayLimit || monthCount >= monthLimit;
  return {
    timezone: typeof row.timezone === "string" ? row.timezone : EMAIL_QUOTA_TIMEZONE,
    day_limit: dayLimit,
    month_limit: monthLimit,
    day_count: dayCount,
    month_count: monthCount,
    day_remaining: asInt(row.day_remaining, Math.max(dayLimit - dayCount, 0)),
    month_remaining: asInt(row.month_remaining, Math.max(monthLimit - monthCount, 0)),
    blocked,
    hit: blocked ? hit || (dayCount >= dayLimit ? "day" : "month") : null,
  };
}

export async function assertEmailQuota(
  // deno-lint-ignore no-explicit-any
  adminClient: any,
): Promise<
  | { ok: true; status: EmailQuotaStatus | null }
  | { ok: false; status: EmailQuotaStatus | null; error: string }
> {
  try {
    const { data, error } = await adminClient.rpc("email_quota_status");
    if (error) {
      console.error("email_quota_status failed", error);
      // Fail open if the RPC is not deployed yet so login/admin mail is not bricked.
      return { ok: true, status: null };
    }
    const status = parseEmailQuotaStatus(data);
    if (status.blocked) {
      return { ok: false, status, error: emailQuotaBlockedMessage(status) };
    }
    return { ok: true, status };
  } catch (err) {
    console.error("assertEmailQuota unexpected error", err);
    return { ok: true, status: null };
  }
}
