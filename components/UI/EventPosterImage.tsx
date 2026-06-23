import React from 'react';

interface EventPosterImageProps {
  src: string;
  alt: string;
  className?: string;
}

/** Full-size event poster — preserves the file's native aspect ratio, never distorts. */
export const EventPosterImage: React.FC<EventPosterImageProps> = ({ src, alt, className = '' }) => (
  <div className={`text-center ${className}`}>
    <img
      src={src}
      alt={alt}
      className="inline-block mx-auto max-w-full max-h-[70vh] w-auto h-auto rounded-[10px]"
      loading="eager"
      decoding="async"
      fetchPriority="high"
    />
  </div>
);
