import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
}) => {
  return (
    <div className="relative pt-40 pb-20 flex flex-col items-center justify-center text-center overflow-hidden">
      <div className="relative z-10 container px-4">
        {subtitle && (
            <p className="text-gold font-bold tracking-[0.3em] uppercase mb-4 text-sm md:text-base animate-slide-in-right">{subtitle}</p>
        )}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black text-charcoal mb-4 tracking-tighter leading-none animate-fade-in-up">
          {title}
        </h1>
        <div className="w-24 h-1 bg-gold mx-auto mt-8 rounded-full animate-scale-in delay-200"></div>
      </div>
    </div>
  );
};