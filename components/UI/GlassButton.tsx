import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-sans font-semibold transition-all duration-300 rounded-[4px] backdrop-blur-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#fbcb05]/90 hover:bg-[#fbcb05] text-secondary border border-[#fbcb05]/50 shadow-lg shadow-[#fbcb05]/20",
    dark: "bg-secondary/90 hover:bg-secondary text-white border border-white/10 hover:border-primary/50",
    outline: "bg-transparent border border-secondary/30 text-secondary hover:bg-secondary hover:text-white hover:border-transparent",
    ghost: "bg-transparent text-secondary hover:bg-white/20 border border-transparent",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg tracking-wide",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};