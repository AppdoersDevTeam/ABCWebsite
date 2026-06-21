import React from 'react';

interface EventImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/** Event banner — expects 1920×1080 (16:9) uploads in 16:9 containers. */
export const EventImage: React.FC<EventImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
}) => (
  <img
    src={src}
    alt={alt}
    className={`w-full h-full object-cover object-center ${className}`}
    loading={loading}
  />
);
