import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  variant = 'light' 
}) => {
  const baseStyles = "rounded-[4px] p-6 transition-all duration-300 shadow-sm hover:shadow-md";
  const variantStyles = variant === 'light' 
    ? "glass-panel" 
    : "glass-panel-dark";

  return (
    <div className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </div>
  );
};