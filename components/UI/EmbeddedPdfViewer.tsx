import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

interface EmbeddedPdfViewerProps {
  src: string;
  title: string;
  className?: string;
}

function blockCopyShortcuts(event: React.KeyboardEvent) {
  if (!(event.ctrlKey || event.metaKey)) return;
  const key = event.key.toLowerCase();
  if (key === 'c' || key === 'a' || key === 's' || key === 'p' || key === 'x') {
    event.preventDefault();
  }
}

/**
 * In-page PDF viewer — canvas-only rendering (no selectable text layer),
 * no download / open-in-new-tab affordances, copy shortcuts blocked.
 * Screenshots and determined users can still capture content; this is a UX deterrent.
 */
export const EmbeddedPdfViewer: React.FC<EmbeddedPdfViewerProps> = ({
  src,
  title,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const renderGeneration = useRef(0);

  const preventCopy = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !src) return;

    const generation = ++renderGeneration.current;
    let cancelled = false;

    const render = async () => {
      setIsLoading(true);
      setError(null);
      setPageCount(0);
      container.replaceChildren();

      try {
        const pdf = await getDocument({ url: src, withCredentials: false }).promise;
        if (cancelled || generation !== renderGeneration.current) return;

        setPageCount(pdf.numPages);

        const containerWidth = Math.max(container.clientWidth - 32, 280);
        const dpr = window.devicePixelRatio || 1;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled || generation !== renderGeneration.current) return;

          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = containerWidth / baseViewport.width;
          const viewport = page.getViewport({ scale: scale * dpr });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${viewport.width / dpr}px`;
          canvas.style.height = `${viewport.height / dpr}px`;
          canvas.style.display = 'block';
          canvas.style.margin = '0 auto 1rem';
          canvas.draggable = false;
          canvas.setAttribute('aria-hidden', 'true');

          const context = canvas.getContext('2d');
          if (!context) throw new Error('Could not render PDF page');

          await page.render({ canvasContext: context, viewport, canvas }).promise;
          if (cancelled || generation !== renderGeneration.current) return;

          container.appendChild(canvas);
        }
      } catch (err) {
        if (cancelled || generation !== renderGeneration.current) return;
        console.error('Error rendering PDF:', err);
        setError('Unable to display this PDF. Please try again later.');
      } finally {
        if (!cancelled && generation === renderGeneration.current) {
          setIsLoading(false);
        }
      }
    };

    void render();

    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div
      className={`w-full rounded-[4px] border border-gray-200 overflow-hidden bg-gray-50 ${className}`}
      role="region"
      aria-label={title}
      onContextMenu={preventCopy}
      onCopy={preventCopy}
      onCut={preventCopy}
      onPaste={preventCopy}
      onDragStart={preventCopy}
      onKeyDown={blockCopyShortcuts}
      tabIndex={0}
    >
      <div
        ref={scrollRef}
        className="w-full h-[50vh] min-h-[320px] md:h-[75vh] overflow-y-auto overflow-x-hidden p-4 select-none"
        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
      >
        {isLoading && (
          <p className="text-center text-neutral text-sm py-12">Loading document…</p>
        )}
        {error && !isLoading && (
          <p className="text-center text-red-600 text-sm py-12">{error}</p>
        )}
      </div>
      {!isLoading && !error && pageCount > 0 && (
        <p className="text-xs text-neutral text-center py-2 border-t border-gray-200 bg-white">
          {pageCount} {pageCount === 1 ? 'page' : 'pages'} — view only
        </p>
      )}
    </div>
  );
};
