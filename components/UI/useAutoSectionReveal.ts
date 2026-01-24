import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SECTION_SELECTOR = 'main section';

export const useAutoSectionReveal = () => {
  const location = useLocation();

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR))
      .filter((section) => !section.hasAttribute('data-no-reveal'));

    if (!sections.length) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      sections.forEach((section) => section.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    sections.forEach((section) => {
      section.classList.add('animate-on-scroll');
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [location.pathname, location.hash]);
};
