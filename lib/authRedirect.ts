/** Canonical app origin for auth redirects (prefer env over current tab). */
export function getAppSiteUrl(): string {
  const envSiteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '');
  if (envSiteUrl) return envSiteUrl;

  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '');
  }

  return '';
}

/** Hash-route path for auth email links (e.g. `/auth/callback`). */
export function getAuthEmailRedirectUrl(hashRoute: string): string {
  const route = hashRoute.startsWith('/') ? hashRoute : `/${hashRoute}`;
  const origin = getAppSiteUrl();
  return `${origin}/#${route}`;
}
