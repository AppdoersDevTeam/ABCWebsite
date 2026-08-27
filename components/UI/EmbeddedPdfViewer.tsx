import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy, type RenderTask } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

interface EmbeddedPdfViewerProps {
  src: string;
  title: string;
  className?: string;
}

interface PageImage {
  pageNumber: number;
  url: string;
}

function blockCopyShortcuts(event: React.KeyboardEvent) {
  if (!(event.ctrlKey || event.metaKey)) return;
  const key = event.key.toLowerCase();
  if (key === 'c' || key === 'a' || key === 's' || key === 'p' || key === 'x') {
    event.preventDefault();
  }
}

function revokePageUrls(pages: PageImage[]) {
  pages.forEach((page) => URL.revokeObjectURL(page.url));
}

/**
 * In-page PDF viewer — canvas-only rendering (no selectable text layer),
 * no download / open-in-new-tab affordances, copy shortcuts blocked.
 */
export const EmbeddedPdfViewer: React.FC<EmbeddedPdfViewerProps> = ({
  src,
  title,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PageImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const renderGeneration = useRef(0);
  const pagesRef = useRef<PageImage[]>([]);

  const preventCopy = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    if (!src) return;

    const generation = ++renderGeneration.current;
    let cancelled = false;
    let pdfDoc: PDFDocumentProxy | null = null;
    const renderTasks: RenderTask[] = [];
    const objectUrls: PageImage[] = [];

    const render = async () => {
      setIsLoading(true);
      setError(null);
      setPages((prev) => {
        revokePageUrls(prev);
        return [];
      });

      try {
        const loadingTask = getDocument({ url: src, withCredentials: false });
        pdfDoc = await loadingTask.promise;

        if (cancelled || generation !== renderGeneration.current) return;

        const containerWidth = Math.max(scrollRef.current?.clientWidth ?? 800, 280) - 32;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const nextPages: PageImage[] = [];

        for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber += 1) {
          if (cancelled || generation !== renderGeneration.current) return;

          const page = await pdfDoc.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = containerWidth / baseViewport.width;
          const viewport = page.getViewport({ scale: scale * dpr });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const context = canvas.getContext('2d');
          if (!context) throw new Error('Could not render PDF page');

          const task = page.render({ canvasContext: context, viewport, canvas });
          renderTasks.push(task);
          await task.promise;

          if (cancelled || generation !== renderGeneration.current) return;

          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (result) => (result ? resolve(result) : reject(new Error('Could not encode PDF page'))),
              'image/jpeg',
              0.92
            );
          });

          const url = URL.createObjectURL(blob);
          nextPages.push({ pageNumber, url });
          objectUrls.push({ pageNumber, url });
        }

        if (cancelled || generation !== renderGeneration.current) return;
        setPages(nextPages);
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
      renderTasks.forEach((task) => {
        try {
          task.cancel();
        } catch {
          // ignore cancel errors
        }
      });
      if (pdfDoc) {
        pdfDoc.destroy();
      }
      revokePageUrls(objectUrls);
    };
  }, [src]);

  useEffect(() => {
    return () => {
      revokePageUrls(pagesRef.current);
    };
  }, []);

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
        className="relative w-full h-[50vh] min-h-[320px] md:h-[75vh] overflow-y-auto overflow-x-hidden p-4 select-none"
        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
      >
        {isLoading && (
          <p className="text-center text-neutral text-sm py-12">Loading document…</p>
        )}
        {error && !isLoading && (
          <p className="text-center text-red-600 text-sm py-12">{error}</p>
        )}
        {!isLoading && !error &&
          pages.map((page) => (
            <img
              key={page.pageNumber}
              src={page.url}
              alt=""
              draggable={false}
              className="block mx-auto mb-4 max-w-full h-auto pointer-events-none"
            />
          ))}
      </div>
      {!isLoading && !error && pages.length > 0 && (
        <p className="text-xs text-neutral text-center py-2 border-t border-gray-200 bg-white">
          {pages.length} {pages.length === 1 ? 'page' : 'pages'} — view only
        </p>
      )}
    </div>
  );
};
