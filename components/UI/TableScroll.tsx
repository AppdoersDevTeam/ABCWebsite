import React from 'react';

type TableScrollProps = {
  children: React.ReactNode;
  label?: string;
  className?: string;
};

/** Wide tables stay tabular; phones get a labelled sideways-scroll region. */
export const TableScroll: React.FC<TableScrollProps> = ({
  children,
  label = 'Swipe sideways to see all columns',
  className = '',
}) => (
  <div className={`min-w-0 ${className}`.trim()}>
    <p className="mb-2 text-xs text-neutral md:hidden">{label}</p>
    <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">{children}</div>
  </div>
);
