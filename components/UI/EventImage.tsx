import React from 'react';

interface EventImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/** Displays event flyer/photo without cropping; blurred fill behind contained image. */
export const EventImage: React.FC<EventImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
}) => (
  <div className={`relative w-full h-full overflow-hidden bg-[#2d3a16] ${className}`}>
    <img
      src={src}
      alt=""
      aria-hidden
      className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50"
      loading={loading}
    />
    <img src={src} alt={alt} className="relative z-10 w-full h-full object-contain" loading={loading} />
  </div>
);
