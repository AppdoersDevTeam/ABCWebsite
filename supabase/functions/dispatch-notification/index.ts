import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "devteam@appdoers.co.nz";
const SITE_URL = "https://ashburtonbaptist.co.nz";

const NOTIFICATION_TYPES = [
  "content.newsletter",
  "content.devotional",
  "content.event",
  "content.roster",
  "prayer.request_created",
  "prayer.count_added",
  "event.rsvp_submitted",
  "user.signup",
  "user.approved",
  "user.denied",
  "user.access_held",
  "user.access_restored",
  "user.admin_granted",
  "user.admin_revoked",
  "system.push_test",
] as const;

type NotificationType = (typeof NOTIFICATION_TYPES)[number];

type PreferenceColumn =
  | "content_newsletter"
  | "content_devotional"
  | "content_event"
  | "content_roster"
  | "prayer"
  | "admin_rsvp"
  | "admin_signup"
  | "user_lifecycle";

const PREFERENCE_BY_TYPE: Record<NotificationType, PreferenceColumn | null> = {
  "content.newsletter": "content_newsletter",
  "content.devotional": "content_devotional",
  "content.event": "content_event",
  "content.roster": "content_roster",
  "prayer.request_created": "prayer",
  "prayer.count_added": "prayer",
  "event.rsvp_submitted": "admin_rsvp",
  "user.signup": "admin_signup",
  "user.approved": "user_lifecycle",
  "user.denied": "user_lifecycle",
  "user.access_held": "user_lifecycle",
  "user.access_restored": "user_lifecycle",
  "user.admin_granted": "user_lifecycle",
  "user.admin_revoked": "user_lifecycle",
  "system.push_test": null,
};

type DispatchBody = {
  type?: string;
  title?: string;
  body?: string;
  href?: string;
  entityId?: string;
  targetUserId?: string;
  audience?: string;
  eventTitle?: string;
  rsvpName?: string;
  rsvpEmail?: string;
};

type UserRow = {
  id: string;
  email: string | null;
  role: string | null;
  is_approved: boolean | null;
  is_access_held?: boolean | null;
  is_super_admin?: boolean | null;
};

type PreferenceRow = {
  user_id: string;
  push_enabled: boolean;
  content_newsletter: boolean;
  content_devotional: boolean;
  content_event: boolean;
  content_roster: boolean;
  prayer: boolean;
  admin_rsvp: boolean;
  admin_signup: boolean;
  user_lifecycle: boolean;
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isNotificationType(value: string): value is NotificationType {
  return (NOTIFICATION_TYPES as readonly string[]).includes(value);
}

function isAdminProfile(profile: UserRow | null): boolean {
  if (!profile) return false;
  const email = (profile.email || "").trim().toLowerCase();
  if (email === ADMIN_EMAIL) return true;
  return profile.role === "admin" && profile.is_approved === true;
}

function contentEventRecipientRole(audience?: string | null): "member" | "admin" | "none" {
  const value = (audience || "members").toLowerCase();
  if (value === "attendees") return "none";
  if (value === "staff") return "admin";
  return "member";
}

function defaultHref(type: NotificationType, role: "member" | "admin"): string {
  const member = role === "member";
  switch (type) {
    case "content.newsletter":
      return member ? "/dashboard/newsletter" : "/admin/newsletter";
    case "content.devotional":
      return member ? "/dashboard/devotional" : "/admin/devotional";
    case "content.event":
      return member ? "/dashboard/events" : "/admin/events";
    case "content.roster":
      return member ? "/dashboard/roster" : "/admin/roster";
    case "prayer.request_created":
      return "/admin/prayer";
    case "prayer.count_added":
      return "/dashboard/prayer";
    case "event.rsvp_submitted":
      return "/admin/events";
    case "user.signup":
      return "/admin/users";
    case "user.approved":
    case "user.denied":
    case "user.access_held":
    case "user.access_restored":
      return "/login";
    case "user.admin_granted":
      return "/admin";
    case "user.admin_revoked":
      return "/dashboard";
    case "system.push_test":
      return member ? "/dashboard" : "/admin";
    default:
      return member ? "/dashboard" : "/admin";
  }
}

async function authorizedForType(
  type: NotificationType,
  caller: UserRow | null,
  isServiceRole: boolean,
  body: DispatchBody,
  adminClient: SupabaseClient,
): Promise<boolean> {
  if (isServiceRole) return true;
  if (!caller) {
    if (type !== "event.rsvp_submitted") return false;
    const eventId = body.entityId?.trim();
    const email = body.rsvpEmail?.trim().toLowerCase();
    if (!eventId || !email) return false;
    const { data } = await adminClient
      .from("event_rsvps")
      .select("id")
      .eq("event_id", eventId)
      .ilike("email", email)
      .maybeSingle();
    return Boolean(data);
  }

  if (isAdminProfile(caller)) return true;

  if (type === "system.push_test") {
    return caller.is_approved === true || isAdminProfile(caller);
  }

  if (type === "user.signup") {
    return !body.targetUserId || body.targetUserId === caller.id;
  }
  if (type === "prayer.request_created" || type === "prayer.count_added") {
    return caller.is_approved === true;
  }
  if (type === "event.rsvp_submitted") {
    return true;
  }
  return false;
}

async function resolveRecipients(
  adminClient: SupabaseClient,
  type: NotificationType,
  actorId: string | null,
  body: DispatchBody,
): Promise<UserRow[]> {
  const lifecycleTypes: NotificationType[] = [
    "user.approved",
    "user.denied",
    "user.access_held",
    "user.access_restored",
    "user.admin_granted",
    "user.admin_revoked",
  ];

  if (lifecycleTypes.includes(type)) {
    const targetId = body.targetUserId?.trim();
    if (!targetId) return [];
    const { data } = await adminClient
      .from("users")
      .select("id, email, role, is_approved, is_access_held, is_super_admin")
      .eq("id", targetId)
      .maybeSingle();
    return data ? [data as UserRow] : [];
  }

  if (type === "system.push_test") {
    if (!actorId) return [];
    const { data } = await adminClient
      .from("users")
      .select("id, email, role, is_approved, is_access_held, is_super_admin")
      .eq("id", actorId)
      .maybeSingle();
    return data ? [data as UserRow] : [];
  }

  if (type === "prayer.count_added") {
    const targetId = body.targetUserId?.trim();
    if (!targetId || targetId === actorId) return [];
    const { data } = await adminClient
      .from("users")
      .select("id, email, role, is_approved, is_access_held, is_super_admin")
      .eq("id", targetId)
      .maybeSingle();
    return data ? [data as UserRow] : [];
  }

  // Admin operational alerts: notify every approved admin, including the actor.
  // Solo-admin churches and self-tests otherwise get an empty inbox after posting.
  if (
    type === "prayer.request_created" ||
    type === "event.rsvp_submitted" ||
    type === "user.signup"
  ) {
    const { data } = await adminClient
      .from("users")
      .select("id, email, role, is_approved, is_access_held, is_super_admin")
      .eq("role", "admin")
      .eq("is_approved", true);
    return (data || []) as UserRow[];
  }

  if (type === "content.event") {
    const role = contentEventRecipientRole(body.audience);
    if (role === "none") return [];
    let query = adminClient
      .from("users")
      .select("id, email, role, is_approved, is_access_held, is_super_admin")
      .eq("is_approved", true)
      .or("is_access_held.is.null,is_access_held.eq.false");
    query = role === "admin" ? query.eq("role", "admin") : query.eq("role", "member");
    const { data } = await query;
    return ((data || []) as UserRow[]).filter((row) => row.id !== actorId);
  }

  const { data } = await adminClient
    .from("users")
    .select("id, email, role, is_approved, is_access_held, is_super_admin")
    .eq("role", "member")
    .eq("is_approved", true)
    .or("is_access_held.is.null,is_access_held.eq.false");
  return ((data || []) as UserRow[]).filter((row) => row.id !== actorId);
}

function hrefForRecipient(
  type: NotificationType,
  recipient: UserRow,
  override?: string,
): string {
  if (override && override.startsWith("/")) return override;
  const role = recipient.role === "admin" ? "admin" : "member";
  return defaultHref(type, role);
}

async function loadVapidDetails(
  adminClient: SupabaseClient,
): Promise<{ publicKey: string; privateKey: string; subject: string } | null> {
  let publicKey = Deno.env.get("VAPID_PUBLIC_KEY") || "";
  let privateKey = Deno.env.get("VAPID_PRIVATE_KEY") || "";
  let subject = Deno.env.get("VAPID_SUBJECT") || "mailto:office@ashburtonbaptist.co.nz";

  if (!publicKey || !privateKey) {
    const { data, error } = await adminClient.rpc("get_vapid_config");
    if (error) {
      console.error("Failed to load VAPID config", error);
    } else if (data && typeof data === "object") {
      const row = data as Record<string, string>;
      publicKey = publicKey || row.VAPID_PUBLIC_KEY || "";
      privateKey = privateKey || row.VAPID_PRIVATE_KEY || "";
      subject = row.VAPID_SUBJECT || subject;
    }
  }

  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

async function sendPushToUsers(
  adminClient: SupabaseClient,
  userIds: string[],
  payload: { title: string; body: string; href: string },
): Promise<{ sent: number; removed: number }> {
  if (userIds.length === 0) return { sent: 0, removed: 0 };

  const vapid = await loadVapidDetails(adminClient);
  if (!vapid) {
    console.error("Missing VAPID keys; skipping Web Push");
    return { sent: 0, removed: 0 };
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const { data: subs, error } = await adminClient
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("user_id", userIds);

  if (error) {
    console.error("Failed to load push subscriptions", error);
    return { sent: 0, removed: 0 };
  }

  let sent = 0;
  let removed = 0;
  const staleIds: string[] = [];
  const jsonPayload = JSON.stringify(payload);

  for (const sub of subs || []) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        jsonPayload,
        { TTL: 60 * 60 * 24, urgency: "high", contentEncoding: "aes128gcm" },
      );
      sent += 1;
      console.log("Web Push sent", sub.id);
    } catch (err) {
      const status = (err as { statusCode?: number; body?: string; message?: string }).statusCode;
      const message = (err as { message?: string }).message || String(err);
      console.error("Web Push send failed", status, message, err);
      if (status === 404 || status === 410) {
        staleIds.push(sub.id);
        removed += 1;
      }
    }
  }

  if (staleIds.length > 0) {
    await adminClient.from("push_subscriptions").delete().in("id", staleIds);
  }

  return { sent, removed };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const isServiceRole = Boolean(token && token === serviceRoleKey);

    let body: DispatchBody;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const typeRaw = (body.type || "").trim();
    if (!isNotificationType(typeRaw)) {
      return jsonResponse({ error: "Unknown notification type" }, 400);
    }
    const type = typeRaw;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    let caller: UserRow | null = null;

    if (!isServiceRole) {
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const {
        data: { user },
      } = await userClient.auth.getUser();
      if (user) {
        const { data: profile } = await adminClient
          .from("users")
          .select("id, email, role, is_approved, is_access_held, is_super_admin")
          .eq("id", user.id)
          .maybeSingle();
        caller = (profile as UserRow | null) || {
          id: user.id,
          email: user.email || null,
          role: "member",
          is_approved: false,
        };
      }
    }

    const allowed = await authorizedForType(type, caller, isServiceRole, body, adminClient);
    if (!allowed) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    const recipients = await resolveRecipients(adminClient, type, caller?.id ?? null, body);
    if (recipients.length === 0) {
      return jsonResponse({ ok: true, inserted: 0, pushed: 0 });
    }

    const column = PREFERENCE_BY_TYPE[type];
    const { data: prefRows } = await adminClient
      .from("notification_preferences")
      .select(
        "user_id, push_enabled, content_newsletter, content_devotional, content_event, content_roster, prayer, admin_rsvp, admin_signup, user_lifecycle",
      )
      .in(
        "user_id",
        recipients.map((row) => row.id),
      );

    const prefsByUser = new Map<string, PreferenceRow>(
      ((prefRows || []) as PreferenceRow[]).map((row) => [row.user_id, row]),
    );

    const inboxRecipients = recipients.filter((row) => {
      if (!column) return true;
      const prefs = prefsByUser.get(row.id);
      if (!prefs) return true;
      return prefs[column] !== false;
    });

    if (inboxRecipients.length === 0) {
      return jsonResponse({ ok: true, inserted: 0, pushed: 0 });
    }

    const title = (body.title || "Ashburton Baptist Church").trim().slice(0, 180);
    const textBody = (body.body || "").trim().slice(0, 500);
    const rows = inboxRecipients.map((row) => ({
      user_id: row.id,
      type,
      title,
      body: textBody,
      href: hrefForRecipient(type, row, body.href),
      entity_id: body.entityId || null,
    }));

    const { error: insertError } = await adminClient.from("notifications").insert(rows);
    if (insertError) {
      console.error("Failed to insert notifications", insertError);
      return jsonResponse({ error: "Failed to create notifications" }, 500);
    }

    const pushUserIds = inboxRecipients
      .filter((row) => {
        if (type === "system.push_test") return true;
        return prefsByUser.get(row.id)?.push_enabled === true;
      })
      .map((row) => row.id);

    let pushed = 0;
    let removed = 0;
    if (pushUserIds.length > 0) {
      const href = rows[0]?.href || "/dashboard";
      const result = await sendPushToUsers(adminClient, pushUserIds, {
        title,
        body: textBody,
        href,
      });
      pushed = result.sent;
      removed = result.removed;
      console.log("dispatch-notification push result", { type, pushUserIds: pushUserIds.length, pushed, removed });
    } else {
      console.log("dispatch-notification skipped push (no push_enabled recipients)", { type });
    }

    return jsonResponse({
      ok: true,
      inserted: rows.length,
      pushed,
      pushRemoved: removed,
    });
  } catch (err) {
    console.error("dispatch-notification unexpected error", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
