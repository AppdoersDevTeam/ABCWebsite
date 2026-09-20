import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Newsletter } from '../../types';
import { groupNewslettersByMonth } from '../../lib/newsletters';

const VISIBLE_MONTHS = 4;

interface NewsletterMonthArchiveProps {
  items: Newsletter[];
  emptyMessage: string;
  renderItem: (newsletter: Newsletter) => React.ReactNode;
}

export const NewsletterMonthArchive: React.FC<NewsletterMonthArchiveProps> = ({
  items,
  emptyMessage,
  renderItem,
}) => {
  const groups = useMemo(() => groupNewslettersByMonth(items), [items]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number | undefined>();
  const [openMonths, setOpenMonths] = useState<Set<string>>(() => new Set());

  const toggleMonth = (key: string) => {
    setOpenMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useLayoutEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const measure = () => {
      const months = Array.from(root.querySelectorAll<HTMLElement>('[data-month-group]'));
      if (months.length <= VISIBLE_MONTHS) {
        setMaxHeight(undefined);
        return;
      }
      const lastVisible = months[VISIBLE_MONTHS - 1];
      const padBottom = parseFloat(getComputedStyle(root).paddingBottom) || 0;
      setMaxHeight(lastVisible.offsetTop + lastVisible.offsetHeight + padBottom);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    for (const child of Array.from(root.children)) {
      observer.observe(child);
    }
    return () => observer.disconnect();
  }, [groups, openMonths]);

  if (items.length === 0) {
    return <p className="text-neutral text-sm">{emptyMessage}</p>;
  }

  return (
    <div className="min-w-0 rounded-[8px] border border-gray-200 bg-white overflow-hidden">
      <div
        ref={scrollRef}
        className="relative overflow-y-auto overscroll-y-contain p-3 space-y-2"
        style={maxHeight ? { maxHeight } : undefined}
        aria-label="Newsletter archive grouped by month"
      >
        {groups.map((group) => {
          const isOpen = openMonths.has(group.key);
          const panelId = `newsletter-month-${group.key}`;
          return (
            <section key={group.key} data-month-group className="min-w-0">
              <button
                type="button"
                onClick={() => toggleMonth(group.key)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-center gap-2 text-left min-h-[44px] px-1 rounded-[4px] hover:bg-gray-200 transition-colors"
              >
                <span
                  className="w-5 shrink-0 text-center text-base font-bold text-charcoal leading-none"
                  aria-hidden="true"
                >
                  {isOpen ? '−' : '+'}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-charcoal border-b border-transparent">
                  {group.label}
                </span>
              </button>
              {isOpen && (
                <div id={panelId} className="space-y-2 pt-1 pl-7">
                  {group.items.map((item) => renderItem(item))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
