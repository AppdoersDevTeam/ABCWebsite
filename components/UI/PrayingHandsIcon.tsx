import React from 'react';

type PrayingHandsIconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

/** Lucide-style praying hands for prayer nav and dashboard cards. */
export const PrayingHandsIcon: React.FC<PrayingHandsIconProps> = ({
  size = 24,
  className,
  strokeWidth = 2,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 5c.5 1.8 1 4.2 1 7" />
    <path d="M12 5c-.5 1.8-1 4.2-1 7" />
    <path d="M11 6.2C9.2 6.6 7.8 8.2 7.6 10c-.2 1.6.5 3 1.6 4" />
    <path d="M13 6.2c1.8.4 3.2 2 3.4 3.8.2 1.6-.5 3-1.6 4" />
    <path d="m9.2 14.2-2 5.3a1.8 1.8 0 0 0 3.3 1.3L12 16" />
    <path d="m14.8 14.2 2 5.3a1.8 1.8 0 0 1-3.3 1.3L12 16" />
  </svg>
);
