export type RecordEmailSendInput = {
  recipientEmail: string;
  recipientUserId?: string | null;
  templateKey: string;
  subject?: string | null;
  resendId?: string | null;
  actorId?: string | null;
  metadata?: Record<string, unknown>;
};

export function resendIdFromBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const id = (body as { id?: unknown }).id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

/** Fire-and-forget safe: logs errors, never throws to the caller. */
export async function recordEmailSend(
  // deno-lint-ignore no-explicit-any
  adminClient: any,
  input: RecordEmailSendInput,
): Promise<void> {
  const recipientEmail = (input.recipientEmail || "").trim().toLowerCase();
  if (!recipientEmail) return;

  let recipientKind: "user" | "leadership" = "user";
  let teamMemberId: string | null = null;

  try {
    const { data: byEmail } = await adminClient
      .from("team_members")
      .select("id")
      .ilike("email", recipientEmail)
      .limit(1);
    if (byEmail?.[0]?.id) {
      teamMemberId = byEmail[0].id;
      recipientKind = "leadership";
    } else if (input.recipientUserId) {
      const { data: byUser } = await adminClient
        .from("team_members")
        .select("id")
        .eq("user_id", input.recipientUserId)
        .limit(1);
      if (byUser?.[0]?.id) {
        teamMemberId = byUser[0].id;
        recipientKind = "leadership";
      }
    }
  } catch (err) {
    console.error("recordEmailSend leadership lookup failed", err);
  }

  const { error } = await adminClient.from("email_sends").insert({
    recipient_email: recipientEmail,
    recipient_kind: recipientKind,
    template_key: input.templateKey,
    subject: input.subject ?? null,
    recipient_user_id: input.recipientUserId ?? null,
    recipient_team_member_id: teamMemberId,
    resend_id: input.resendId?.trim() || null,
    actor_id: input.actorId ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) {
    console.error("recordEmailSend insert failed", error.message);
  }
}
