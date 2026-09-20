import React from 'react';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

/** Shared page header for admin and member dashboard left-menu pages. */
export const AdminPageHeader = ({ title, subtitle, icon, rightSlot }: AdminPageHeaderProps) => {
  return (
    <div className="glass-card bg-white/80 border border-white/60 rounded-[16px] p-6 md:p-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4 min-w-0">
        {icon && (
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gold/10 text-gold flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-gold">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm md:text-base leading-relaxed" style={{ color: '#4b5563' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {rightSlot && (
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 sm:items-center">
          {rightSlot}
        </div>
      )}
    </div>
  );
};
