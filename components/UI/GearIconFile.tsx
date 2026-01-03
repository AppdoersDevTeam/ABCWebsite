import React from 'react';

interface GearIconFileProps {
  size?: number;
  className?: string;
}

/**
 * Gear Icon Component - Loads from SVG file
 * 
 * To use:
 * 1. Visit: https://www.flaticon.com/free-icon/gear_5532899
 * 2. Click "Free Download" and download the SVG file
 * 3. Save it as 'gear-icon.svg' in the public/icons/ directory
 * 4. This component will automatically load it
 */
export const GearIconFile: React.FC<GearIconFileProps> = ({ 
  size = 24, 
  className = '' 
}) => {
  return (
    <img 
      src="/icons/gear-icon.svg" 
      alt="Gear Icon" 
      width={size} 
      height={size}
      className={className}
      style={{ display: 'inline-block' }}
    />
  );
};




