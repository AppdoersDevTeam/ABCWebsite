import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { User } from '../types';

async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T | null> {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));
  const res = (await Promise.race([p, timeout])) as any;
  if (res === null) {
    console.warn(`syncDirectoryUserLink: timeout (${label}) after ${ms}ms`);
    return null;
  }
  return res as T;
}

function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const t = email.trim().toLowerCase();
  return t.length ? t : null;
}

function normalizeName(name: string | null | undefined): string {
  return (name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Links the logged-in user to a `team_members` row (Directory) so group memberships apply.
 * - If already linked by `user_id`, no-op.
 * - Else match by email (case-insensitive); if multiple rows, prefer name match to `userRow.name`.
 * - If still ambiguous or no match, insert a minimal attendee directory row and link it.
 * Fails soft: logs errors; does not throw to avoid breaking login.
 */
export async function syncDirectoryUserLink(supabaseUser: SupabaseUser, userRow: User): Promise<void> {
  const uid = supabaseUser.id;
  const emailNorm = normalizeEmail(supabaseUser.email || userRow.email);
  if (!emailNorm) {
    console.warn('syncDirectoryUserLink: no email on auth user or profile, skipping');
    return;
  }

  try {
    const byUidRes = await withTimeout(
      supabase
        .from('team_members')
        .select('id, user_id, created_from_user_sync')
        .eq('user_id', uid)
        .maybeSingle(),
      2500,
      'lookup_by_user_id'
    );
    if (!byUidRes) return;
    const { data: byUid, error: uidErr } = byUidRes as any;

    if (uidErr) {
      console.warn('syncDirectoryUserLink: lookup by user_id failed', uidErr);
      return;
    }
    if (byUid?.id) {
      return;
    }

    const byEmailRes = await withTimeout(
      supabase
        .from('team_members')
        .select('id, name, email, user_id, created_from_user_sync')
        .ilike('email', emailNorm),
      2500,
      'lookup_by_email'
    );
    if (!byEmailRes) return;
    const { data: byEmail, error: emailErr } = byEmailRes as any;

    if (emailErr) {
      console.warn('syncDirectoryUserLink: lookup by email failed', emailErr);
      return;
    }

    const candidates = (byEmail || []).filter((r: { user_id?: string | null }) => !r.user_id);
    const withUserId = (byEmail || []).filter((r: { user_id?: string | null }) => r.user_id);

    if (withUserId.length > 0) {
      // Another row already claims this email with a different user_id — let admins resolve.
      console.warn('syncDirectoryUserLink: email already linked to another user_id, skipping auto-link');
      return;
    }

    let chosenId: string | null = null;
    let chosenFromExisting = false;

    if (candidates.length === 1) {
      chosenId = candidates[0].id;
      chosenFromExisting = true;
    } else if (candidates.length > 1) {
      const display = normalizeName(userRow.name);
      const nameMatches = candidates.filter((c: { name?: string }) => normalizeName(c.name) === display);
      if (nameMatches.length === 1) {
        chosenId = nameMatches[0].id;
        chosenFromExisting = true;
      } else {
        console.warn(
          'syncDirectoryUserLink: ambiguous email match (multiple directory people), skipping auto-link'
        );
        return;
      }
    }

    if (chosenId) {
      const updRes = await withTimeout(
        supabase
          .from('team_members')
          .update({ user_id: uid, created_from_user_sync: false })
          .eq('id', chosenId),
        2500,
        'link_existing'
      );
      const updErr = (updRes as any)?.error;
      if (updErr) {
        console.warn('syncDirectoryUserLink: failed to link existing directory row', updErr);
      }
      return;
    }

    const displayName = [userRow.first_name, userRow.last_name].filter(Boolean).join(' ').trim() || userRow.name || 'Member';
    const phone = (userRow.phone || '').trim() || '0';

    const insertPayload: Record<string, unknown> = {
      name: displayName,
      role: 'Attendee',
      profile_type: 'attendee',
      email: emailNorm,
      phone,
      img: '',
      description: '',
      user_id: uid,
      created_from_user_sync: true,
    };

    const insRes = await withTimeout(
      supabase.from('team_members').insert([insertPayload]),
      2500,
      'create_shell'
    );
    const insErr = (insRes as any)?.error;
    if (insErr) {
      if (String(insErr.message || '').includes('user_id') || String(insErr.code) === '42703') {
        console.warn(
          'syncDirectoryUserLink: insert failed (run ADD_TEAM_MEMBERS_USER_ID.sql in Supabase).',
          insErr
        );
      } else {
        console.warn('syncDirectoryUserLink: failed to create directory shell', insErr);
      }
    }
  } catch (e) {
    console.warn('syncDirectoryUserLink: unexpected error', e);
  }
}
