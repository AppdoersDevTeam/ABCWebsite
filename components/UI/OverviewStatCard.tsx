import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface OverviewStatCardProps {
  icon: React.ReactNode;
  iconClassName?: string;
  label: string;
  value: React.ReactNode;
  description?: React.ReactNode;
  footerLabel?: string;
  highlight?: boolean;
  valueClassName?: string;
  className?: string;
}

export const OverviewStatCard: React.FC<OverviewStatCardProps> = ({
  icon,
  iconClassName = 'bg-gray-50 text-charcoal',
  label,
  value,
  description,
  footerLabel = 'View →',
  highlight = false,
  valueClassName = '',
  className = '',
}) => {
  return (
    <div
      className={`glass-card rounded-[8px] p-5 md:p-6 relative transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md group bg-white border border-gray-100 hover:border-gold ${highlight ? 'border-2 border-gold' : ''} ${className}`}
    >
      <div className="absolute top-4 right-4 text-gray-300 group-hover:text-gold transition-colors">
        <ArrowUpRight size={16} />
      </div>
      <div
        className={`mb-3 p-2.5 rounded-full w-10 h-10 flex items-center justify-center transition-colors shrink-0 ${iconClassName} group-hover:bg-gold group-hover:text-white ${highlight ? 'bg-gold/15' : ''}`}
      >
        {icon}
      </div>
      <p className="text-[11px] font-medium text-neutral/70 mb-1">{label}</p>
      <div
        className={`text-sm md:text-base font-serif font-normal leading-snug mb-1 normal-case ${highlight ? 'text-gold' : 'text-charcoal'} ${valueClassName}`}
      >
        {value}
      </div>
      {description ? (
        <p className="text-[11px] text-neutral/80 leading-relaxed mb-2 min-h-[2rem]">{description}</p>
      ) : (
        <div className="mb-2 min-h-[2rem]" />
      )}
      <div className="pt-3 border-t border-gray-100">
        <span className="text-gold font-semibold text-xs">{footerLabel}</span>
      </div>
    </div>
  );
};
