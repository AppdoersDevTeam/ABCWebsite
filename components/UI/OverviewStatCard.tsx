import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SURFACE_HOVER_CLASS } from '../../lib/uiHover';

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
      className={`h-full glass-card hover-surface rounded-[12px] p-5 md:p-6 relative flex flex-col transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg ${SURFACE_HOVER_CLASS} group bg-white border border-gray-100 ${highlight ? 'border-2 border-gold shadow-sm' : ''} ${className}`}
    >
      <div className="absolute top-5 right-5 text-gray-300 group-hover:text-gold transition-colors">
        <ArrowUpRight size={18} />
      </div>
      <div className="flex items-start gap-3 pr-7 mb-4">
        <div
          className={`p-2.5 rounded-full w-11 h-11 flex items-center justify-center transition-colors shrink-0 ${iconClassName} group-hover:bg-gold group-hover:text-white ${highlight ? 'bg-gold/15' : ''}`}
        >
          {icon}
        </div>
        <p className="text-[18px] font-semibold text-charcoal leading-snug pt-1.5">{label}</p>
      </div>
      <div
        className={`${valueSizeClasses[valueSize]} mb-2 normal-case ${highlight ? 'text-gold' : 'text-charcoal'} ${valueClassName}`}
      >
        {value}
      </div>
      {description ? (
        <div className="text-[15px] text-neutral leading-relaxed min-h-[2.75rem]">{description}</div>
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
