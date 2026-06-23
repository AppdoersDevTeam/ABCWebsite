import React from 'react';

interface EventImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/** Event banner — fills 16:9 containers with object-cover (crops, never stretches). */
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
    style={{ objectFit: 'cover', objectPosition: 'center' }}
    loading={loading}
  />
);
