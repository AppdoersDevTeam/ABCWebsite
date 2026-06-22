import { useEffect } from 'react';
import { PageMeta, SITE_NAME, DEFAULT_META } from './seoConfig';

/** Set or create a <meta> tag by attribute (name or property). */
function setMeta(attr: 'name' | 'property', key: string, content: string) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Updates document title and the description / Open Graph / Twitter meta tags
 * for the current page. Safe to call from any public page or layout; the most
 * recent call wins (useful for data-driven pages like event/leadership detail).
 *
 * Pass `null` to opt out entirely (e.g. a layout that defers to a child page
 * which manages its own meta). When `skip` is true the effect is a no-op.
 */
export function usePageMeta(meta?: Partial<PageMeta> | null) {
  const skip = meta === null;
  const rawTitle = meta?.rawTitle;
  const title = meta?.title;
  const description = meta?.description ?? DEFAULT_META.description;

  const fullTitle = title
    ? rawTitle
      ? title
      : `${title} | ${SITE_NAME}`
    : DEFAULT_META.title;

  useEffect(() => {
    if (skip || typeof document === 'undefined') return;

    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title && !rawTitle ? title : SITE_NAME);
    setMeta('property', 'og:description', description);
    setMeta('name', 'twitter:title', title && !rawTitle ? title : SITE_NAME);
    setMeta('name', 'twitter:description', description);
  }, [skip, fullTitle, title, rawTitle, description]);
}
