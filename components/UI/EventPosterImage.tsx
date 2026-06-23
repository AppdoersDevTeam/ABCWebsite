import React from 'react';

interface EventPosterImageProps {
  src: string;
  alt: string;
  className?: string;
}

/** Full-size event poster — never upscales beyond the file's native resolution. */
export const EventPosterImage: React.FC<EventPosterImageProps> = ({ src, alt, className = '' }) => (
  <div className={`flex justify-center ${className}`}>
    <img
      src={src}
      alt={alt}
      className="max-w-full w-auto h-auto max-h-[70vh] object-contain block rounded-[10px]"
      loading="eager"
      decoding="async"
      fetchPriority="high"
    />
  </div>
);
