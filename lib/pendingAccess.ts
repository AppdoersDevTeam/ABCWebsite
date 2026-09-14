const PENDING_PUBLIC_BROWSE_KEY = 'abc-pending-public-browse';

/** Pending user chose Go to Home and may use public pages until they log in again. */
export function allowPendingPublicBrowse(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(PENDING_PUBLIC_BROWSE_KEY, '1');
}

export function clearPendingPublicBrowse(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(PENDING_PUBLIC_BROWSE_KEY);
}

export function canPendingUserBrowsePublic(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(PENDING_PUBLIC_BROWSE_KEY) === '1';
}
