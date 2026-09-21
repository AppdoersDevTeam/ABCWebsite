import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PORTAL_NAV_ICON } from '../../lib/dashboardNav';

type OverviewValueSize = 'stat' | 'title';

interface OverviewStatCardProps {
  icon: React.ReactNode;
  iconClassName?: string;
  label: string;
  value: React.ReactNode;
  description?: React.ReactNode;
  footerLabel?: string;
  highlight?: boolean;
  valueSize?: OverviewValueSize;
  valueClassName?: string;
  className?: string;
}

const valueSizeClasses: Record<OverviewValueSize, string> = {
  stat: 'text-2xl md:text-3xl font-sans font-bold leading-tight tracking-tight text-charcoal',
  title: 'text-base md:text-lg font-sans font-semibold leading-snug text-charcoal',
};

/** 18px arrow increased 35%, matching the gold reference. */
const CARD_ARROW_SIZE = Math.round(18 * 1.35);

export const OverviewStatCard: React.FC<OverviewStatCardProps> = ({
  icon,
  iconClassName = PORTAL_NAV_ICON,
  label,
  value,
  description,
  footerLabel,
  highlight = false,
  valueSize = 'stat',
  valueClassName = '',
  className = '',
}) => {
  return (
    <div
      className={`h-full min-h-0 glass-card rounded-[12px] px-4 py-4 md:px-5 md:py-5 relative flex flex-col gap-3 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg group bg-white border border-gray-100 ${highlight ? 'border-2 border-gold shadow-sm' : ''} ${className}`}
    >
      <div className="absolute top-3 right-3 text-gold pointer-events-none">
        <ArrowUpRight size={CARD_ARROW_SIZE} strokeWidth={3} />
      </div>

      <div className="flex items-center gap-3 pr-8 min-w-0">
        <div
          className={`p-2.5 rounded-full w-10 h-10 flex items-center justify-center transition-colors shrink-0 ${iconClassName} group-hover:bg-gold group-hover:text-charcoal ${highlight ? 'bg-gold/15' : ''}`}
        >
          {icon}
        </div>
        <p className="min-w-0 text-sm md:text-[15px] font-semibold text-charcoal leading-snug">
          {label}
        </p>
      </div>

      <div className={`${valueSizeClasses[valueSize]} min-w-0 break-words ${valueClassName}`}>
        {value}
      </div>

      {description ? (
        <div className="text-sm text-neutral leading-relaxed min-w-0">
          {description}
        </div>
      ) : null}

      {footerLabel ? (
        <div className="pt-3 mt-auto border-t border-gray-100">
          <span className="text-gold font-semibold text-sm">{footerLabel}</span>
        </div>
      ) : null}
    </div>
  );
};
