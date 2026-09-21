import React from 'react';

const AUTH_SHELL =
  'relative flex min-h-[100vh] min-h-[100dvh] items-center justify-center bg-[#A8B774] px-4 pt-[max(8rem,calc(6rem+env(safe-area-inset-top)))] pb-[max(5rem,calc(3rem+env(safe-area-inset-bottom)))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]';

const AUTH_CARD =
  'relative z-10 min-w-0 w-full max-w-md space-y-6 rounded-[16px] border border-white/50 bg-white/80 p-4 shadow-xl backdrop-blur-xl glass-card sm:space-y-8 sm:p-6 md:p-10';

export const AuthPageShell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={AUTH_SHELL}>
    <div className={`${AUTH_CARD} ${className}`.trim()}>{children}</div>
  </div>
);
