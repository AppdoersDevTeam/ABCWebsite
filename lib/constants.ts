// Application Constants

// Super admin email — this account is always super admin.
// Other admins are promoted via the admin dashboard by a super admin.
export const ADMIN_EMAIL = 'devteam@appdoers.co.nz';
export const SUPER_ADMIN_EMAIL = ADMIN_EMAIL;
export const CONTACT_FORM_RECIPIENT = 'pastor@ashburtonbaptist.co.nz';

export const CHURCH_NAME = 'Ashburton Baptist Church';
export const CHURCH_OFFICE_EMAIL = 'office@ashburtonbaptist.co.nz';
export const CHURCH_WEBSITE_URL = 'https://ashburtonbaptist.co.nz';
/** Public logo URL for emails. Use a simple path — no spaces — for email client compatibility. */
export const CHURCH_LOGO_URL = 'https://ashburtonbaptist.co.nz/abc-logo.png';
export const CHURCH_ADDRESS = '284 Havelock Street, Ashburton 7700';

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

function normalizeEmail(email: string | null | undefined): string {
  return (email || '').trim().toLowerCase();
}

/** True for the Appdoers service account hidden from other admins in user lists. */
export function isServiceAccountEmail(email: string | null | undefined): boolean {
  return normalizeEmail(email) === ADMIN_EMAIL.toLowerCase();
}

/** Whether a user row should appear in admin user-management UIs for the current viewer. */
export function shouldShowUserInAdminList(
  user: { id?: string; email?: string | null } | null | undefined,
  viewer: { id?: string; email?: string | null } | null | undefined
): boolean {
  if (!user || !isServiceAccountEmail(user.email)) return !!user;
  if (!viewer) return false;
  if (viewer.id && user.id && viewer.id === user.id) return true;
  return isServiceAccountEmail(viewer.email);
}

export function filterUsersForAdminView<T extends { id?: string; email?: string | null }>(
  users: T[],
  viewer: { id?: string; email?: string | null } | null | undefined
): T[] {
  return users.filter((u) => shouldShowUserInAdminList(u, viewer));
}
