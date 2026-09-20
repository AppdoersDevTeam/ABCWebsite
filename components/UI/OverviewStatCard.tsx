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
  descriptionClassName?: string;
}

const valueSizeClasses: Record<OverviewValueSize, string> = {
  stat: 'text-[26px] md:text-[30px] font-serif font-normal leading-tight tracking-tight',
  title: 'text-lg md:text-xl font-serif font-normal leading-snug',
};

/** Matches the Users card status-icon row so every card keeps that height. */
const DESCRIPTION_ROW_MIN_HEIGHT = 'min-h-[32px]';

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
  descriptionClassName = '',
}) => {
  return (
    <div
      className={`flex-1 h-full min-h-[148px] glass-card rounded-[12px] px-5 py-3 md:px-6 md:py-3 relative flex flex-col transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg group bg-white border border-gray-100 ${highlight ? 'border-2 border-gold shadow-sm' : ''} ${className}`}
    >
      <div className="absolute top-3 right-5 text-gold">
        <ArrowUpRight size={CARD_ARROW_SIZE} strokeWidth={3} />
      </div>
      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-x-3 shrink-0">
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
        className={`${valueSizeClasses[valueSize]} flex flex-1 items-center justify-center text-center normal-case text-gold ${valueClassName}`}
      >
        {value}
      </div>
      {description ? (
        <div className={`flex ${DESCRIPTION_ROW_MIN_HEIGHT} shrink-0 text-[15px] text-neutral leading-relaxed ${descriptionClassName || 'items-center justify-center'}`}>
          {description}
        </div>
      ) : (
        <div className={`${DESCRIPTION_ROW_MIN_HEIGHT} shrink-0`} />
      )}
      {footerLabel ? (
        <div className="pt-4 mt-auto shrink-0 border-t border-gray-100">
          <span className="text-gold font-semibold text-sm">{footerLabel}</span>
        </div>
      ) : null}
    </div>
  );
};
