import React from 'react';
import { ArrowUpRight } from 'lucide-react';

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
  stat: 'text-2xl md:text-[1.75rem] font-serif font-normal leading-tight tracking-tight',
  title: 'text-lg md:text-xl font-serif font-normal leading-snug',
};

/** 18px arrow increased 35%, matching the gold reference. */
const CARD_ARROW_SIZE = Math.round(18 * 1.35);

export const OverviewStatCard: React.FC<OverviewStatCardProps> = ({
  icon,
  iconClassName = 'bg-gray-50 text-charcoal',
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
      className={`h-full glass-card rounded-[12px] p-5 md:p-6 relative flex flex-col transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg group bg-white border border-gray-100 ${highlight ? 'border-2 border-gold shadow-sm' : ''} ${className}`}
    >
      <div className="absolute top-5 right-5 text-gold">
        <ArrowUpRight size={CARD_ARROW_SIZE} strokeWidth={3} />
      </div>
      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-x-3 mb-2">
        <div
          className={`p-2.5 rounded-full w-11 h-11 flex items-center justify-center transition-colors shrink-0 ${iconClassName} group-hover:bg-gold group-hover:text-white ${highlight ? 'bg-gold/15' : ''}`}
        >
          {icon}
        </div>
        <p className="min-h-11 flex items-center justify-center text-center text-[18px] font-semibold text-charcoal leading-snug">
          {label}
        </p>
        <div aria-hidden="true" />
      </div>
      <div
        className={`${valueSizeClasses[valueSize]} mb-2 text-center normal-case ${highlight ? 'text-gold' : 'text-charcoal'} ${valueClassName}`}
      >
        {value}
      </div>
      {description ? (
        <div className="flex min-h-[2.75rem] items-center text-[15px] text-neutral leading-relaxed">
          {description}
        </div>
      ) : (
        <div className="min-h-[2.75rem]" />
      )}
      {footerLabel ? (
        <div className="pt-4 mt-auto border-t border-gray-100">
          <span className="text-gold font-semibold text-sm">{footerLabel}</span>
        </div>
      ) : null}
    </div>
  );
};
