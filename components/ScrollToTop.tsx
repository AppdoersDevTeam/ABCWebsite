import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const prevPathname = useRef<string>(pathname);

  useEffect(() => {
    // If pathname changed (navigated to a different page), scroll to top
    if (prevPathname.current !== pathname) {
      // Always scroll to top when navigating to a new page
      window.scrollTo(0, 0);
      prevPathname.current = pathname;
    }
    // If only hash changed (same page, different section), don't scroll to top
    // The hash scrolling is handled in PublicLayout
  }, [pathname, hash]);

  return null;
};

