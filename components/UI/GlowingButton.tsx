import React from 'react';

interface GlowingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'outline' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const GlowingButton: React.FC<GlowingButtonProps> = ({ 
  children, 
  variant = 'gold', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center font-sans font-bold uppercase tracking-wider transition-all duration-300 rounded-[4px] overflow-hidden focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    // Solid Yellow - High Pop on White
    gold: "bg-gold text-charcoal hover:bg-yellow-400 shadow-md hover:shadow-lg hover:shadow-gold/30 border border-transparent",
    // Dark Charcoal - High Contrast on White
    dark: "bg-charcoal text-white hover:bg-black border border-transparent shadow-md hover:shadow-lg",
    // Outline - Visible on White
    outline: "bg-transparent border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white",
    // Ghost - Subtle
    ghost: "bg-transparent text-charcoal hover:bg-gold/10 border border-transparent",
  };

  const sizes = {
    sm: "px-5 py-2 text-xs",
    md: "px-8 py-3 text-sm",
    lg: "px-10 py-4 text-base",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};