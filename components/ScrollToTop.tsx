import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const prevPathname = useRef<string>(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      // In-page section targets (e.g. About → #leadership): do not reset scroll — PublicLayout scrolls to the section.
      const section = (hash || '').replace(/^#/, '').trim();
      const skipScrollToTop = pathname === '/about' && section.length > 0;

      if (!skipScrollToTop) {
        window.scrollTo(0, 0);
      }
      prevPathname.current = pathname;
    }
    // Same pathname, only hash changed: leave scroll position; PublicLayout handles section scroll.
  }, [pathname, hash]);

  return null;
};

