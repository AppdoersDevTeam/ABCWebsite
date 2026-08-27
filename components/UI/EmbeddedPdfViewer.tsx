import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentLoadingTask,
  type PDFDocumentProxy,
  type RenderTask,
} from 'pdfjs-dist';
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

/** Ignore scrollbar-induced width jitter when deciding to re-render. */
const WIDTH_RERENDER_THRESHOLD = 32;

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
  const outerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PageImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const renderGeneration = useRef(0);
  const pagesRef = useRef<PageImage[]>([]);
  const lastRenderedWidthRef = useRef(0);
  const lastRenderedSrcRef = useRef('');

  const preventCopy = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  // Measure the outer shell (not the scrolling area) to avoid scrollbar width feedback loops.
  useEffect(() => {
    const element = outerRef.current;
    if (!element) return;

    let frame = 0;
    const updateWidth = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const next = Math.max(Math.round(element.getBoundingClientRect().width), 0);
        setContainerWidth((prev) => (prev === next ? prev : next));
      });
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!src || containerWidth < 200) return;

    const srcChanged = src !== lastRenderedSrcRef.current;
    const widthDelta = Math.abs(containerWidth - lastRenderedWidthRef.current);
    if (!srcChanged && lastRenderedWidthRef.current > 0 && widthDelta < WIDTH_RERENDER_THRESHOLD) {
      return;
    }

    const generation = ++renderGeneration.current;
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;
    const renderTasks: RenderTask[] = [];
    const objectUrls: PageImage[] = [];
    const showInitialLoading = srcChanged || pagesRef.current.length === 0;

    const render = async () => {
      if (showInitialLoading) {
        setIsLoading(true);
        setError(null);
        setPages((prev) => {
          revokePageUrls(prev);
          return [];
        });
      }

      try {
        loadingTask = getDocument({ url: src, withCredentials: false });
        const pdfDoc: PDFDocumentProxy = await loadingTask.promise;

        if (cancelled || generation !== renderGeneration.current) return;

        const pageWidth = Math.max(containerWidth - 16, 260);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const nextPages: PageImage[] = [];

        for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber += 1) {
          if (cancelled || generation !== renderGeneration.current) return;

          const page = await pdfDoc.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = pageWidth / baseViewport.width;
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

        setPages((prev) => {
          revokePageUrls(prev);
          return nextPages;
        });
        lastRenderedWidthRef.current = containerWidth;
        lastRenderedSrcRef.current = src;
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
      if (loadingTask) {
        try {
          loadingTask.destroy();
        } catch {
          // ignore teardown errors during unmount
        }
      }
      revokePageUrls(objectUrls);
    };
  }, [src, containerWidth]);

  useEffect(() => {
    return () => {
      revokePageUrls(pagesRef.current);
    };
  }, []);

  const showLoadingMessage = isLoading && pages.length === 0;

  return (
    <div
      ref={outerRef}
      className={`w-full min-w-0 rounded-[4px] border border-gray-200 overflow-hidden bg-gray-50 ${className}`}
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
        className="relative w-full min-w-0 h-[65dvh] min-h-[280px] sm:h-[55vh] md:h-[70vh] overflow-y-scroll overflow-x-hidden px-2 py-3 sm:p-4 select-none touch-pan-y"
        style={{
          WebkitUserSelect: 'none',
          userSelect: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollbarGutter: 'stable',
        }}
      >
        {showLoadingMessage && (
          <p className="text-center text-neutral text-sm py-12">Loading document…</p>
        )}
        {error && !isLoading && pages.length === 0 && (
          <p className="text-center text-red-600 text-sm py-12 px-2">{error}</p>
        )}
        {pages.map((page) => (
          <img
            key={page.pageNumber}
            src={page.url}
            alt=""
            draggable={false}
            className="block mx-auto mb-3 sm:mb-4 w-full max-w-full h-auto pointer-events-none"
          />
        ))}
      </div>
      {!showLoadingMessage && !error && pages.length > 0 && (
        <p className="text-xs text-neutral text-center py-2 border-t border-gray-200 bg-white">
          {pages.length} {pages.length === 1 ? 'page' : 'pages'} — view only
        </p>
      )}
    </div>
  );
};
