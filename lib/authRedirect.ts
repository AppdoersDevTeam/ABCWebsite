/** Hash-route path for auth email links (e.g. `/auth/callback`). */
export function getAuthEmailRedirectUrl(hashRoute: string): string {
  const route = hashRoute.startsWith('/') ? hashRoute : `/${hashRoute}`;

  if (typeof window !== 'undefined') {
    const origin = window.location.origin.replace(/\/$/, '');
    if (origin) {
      return `${origin}/#${route}`;
    }
  }

  const envSiteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '');
  return `${envSiteUrl || ''}/#${route}`;
}
