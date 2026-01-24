import React from 'react';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export const AdminPageHeader = ({ title, subtitle, icon, rightSlot }: AdminPageHeaderProps) => {
  return (
    <div className="glass-card bg-white/80 border border-white/60 rounded-[16px] p-6 md:p-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="w-14 h-14 rounded-full bg-gold/10 text-gold flex items-center justify-center shadow-sm">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-4xl font-serif font-normal text-charcoal">{title}</h1>
          {subtitle && <p className="text-neutral mt-1">{subtitle}</p>}
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
