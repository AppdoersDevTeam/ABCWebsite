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

export const OverviewStatCard: React.FC<OverviewStatCardProps> = ({
  icon,
  iconClassName = 'bg-gray-50 text-charcoal',
  label,
  value,
  description,
  footerLabel = 'View →',
  highlight = false,
  valueSize = 'stat',
  valueClassName = '',
  className = '',
}) => {
  return (
    <div
      className={`glass-card rounded-[8px] p-6 md:p-7 relative transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg group bg-white border border-gray-100 hover:border-gold ${highlight ? 'border-2 border-gold shadow-sm' : ''} ${className}`}
    >
      <div className="absolute top-5 right-5 text-gray-300 group-hover:text-gold transition-colors">
        <ArrowUpRight size={18} />
      </div>
      <div
        className={`mb-4 p-3 rounded-full w-12 h-12 flex items-center justify-center transition-colors shrink-0 ${iconClassName} group-hover:bg-gold group-hover:text-white ${highlight ? 'bg-gold/15' : ''}`}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold text-charcoal mb-1.5">{label}</p>
      <div
        className={`${valueSizeClasses[valueSize]} mb-2 normal-case ${highlight ? 'text-gold' : 'text-charcoal'} ${valueClassName}`}
      >
        {value}
      </div>
      {description ? (
        <p className="text-sm text-neutral leading-relaxed min-h-[2.75rem]">{description}</p>
      ) : (
        <div className="min-h-[2.75rem]" />
      )}
      <div className="pt-4 mt-3 border-t border-gray-100">
        <span className="text-gold font-semibold text-sm">{footerLabel}</span>
      </div>
    </div>
  );
};
