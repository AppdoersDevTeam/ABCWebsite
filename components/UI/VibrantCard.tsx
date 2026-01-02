import React from 'react';

interface VibrantCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const VibrantCard: React.FC<VibrantCardProps> = ({ 
  children, 
  className = '', 
  glow = false 
}) => {
  return (
    <div className={`glass-card rounded-[8px] px-6 py-[3px] md:px-8 md:py-[11px] relative transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl group animate-scale-in ${className}`}>
      {glow && (
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/30 rounded-full blur-3xl group-hover:bg-gold/40 transition-all duration-500 pointer-events-none mix-blend-multiply"></div>
      )}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};