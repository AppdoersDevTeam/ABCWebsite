// Application Constants

// Super admin email — this account is always super admin.
// Other admins are promoted via the admin dashboard by a super admin.
export const ADMIN_EMAIL = 'devteam@appdoers.co.nz';
export const SUPER_ADMIN_EMAIL = ADMIN_EMAIL;

/** Build a display name from first + last, falling back to legacy name. */
export function displayName(user: { first_name?: string; last_name?: string; name?: string } | null | undefined): string {
  if (!user) return 'User';
  const full = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return full || user.name || 'User';
}

/** Get the user's first initial for avatars. */
export function displayInitial(user: { first_name?: string; name?: string } | null | undefined): string {
  if (!user) return 'U';
  const letter = (user.first_name || user.name || 'U').charAt(0);
  return letter.toUpperCase();
}
