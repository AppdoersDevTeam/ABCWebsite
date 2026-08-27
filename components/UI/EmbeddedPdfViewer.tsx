import React from 'react';

interface EmbeddedPdfViewerProps {
  src: string;
  title: string;
  className?: string;
}

/** Build an embed URL that hides the browser PDF chrome (download/print) where supported. */
export function toEmbedPdfUrl(url: string): string {
  const hashIndex = url.indexOf('#');
  const base = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  return `${base}#toolbar=0&navpanes=0&scrollbar=1`;
}

/**
 * In-page PDF viewer — no download / open-in-new-tab affordances.
 * Soft deterrent only; browsers cannot fully prevent saving a public URL.
 */
export const EmbeddedPdfViewer: React.FC<EmbeddedPdfViewerProps> = ({
  src,
  title,
  className = '',
}) => {
  return (
    <div
      className={`w-full rounded-[4px] border border-gray-200 overflow-hidden bg-gray-50 ${className}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <iframe
        src={toEmbedPdfUrl(src)}
        className="w-full h-[50vh] min-h-[320px] md:h-[75vh] border-0"
        title={title}
      />
    </div>
  );
};
