/** Keep HashRouter URLs on `/#/route` so a refresh never requests a missing Vercel path. */
export function ensureHashRouterUrl(): void {
  if (typeof window === 'undefined') return;

  const { pathname, search, hash, origin } = window.location;
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/' || path === '/index.html') return;

  const lastSegment = path.split('/').pop() || '';
  if (/\.[a-zA-Z0-9]+$/.test(lastSegment)) return;

  const nextHash = hash.startsWith('#/') ? hash : `#${path}${search}${hash}`;
  window.location.replace(`${origin}/${nextHash}`);
}

export function hashRouterHref(path: string): string {
  const route = path.startsWith('/') ? path : `/${path}`;
  return `${window.location.origin}/#${route}`;
}
