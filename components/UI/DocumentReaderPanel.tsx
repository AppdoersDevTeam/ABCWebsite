import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Minimize2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { EmbeddedPdfViewer } from './EmbeddedPdfViewer';

interface DocumentReaderPanelProps {
  label: string;
  title: string;
  subtitle?: string;
  meta?: string;
  pdfUrl: string;
  pdfTitle: string;
  onClose: () => void;
}

const ZOOM_MIN = 1;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.25;

/** Mobile-friendly in-page PDF reader with sticky header and a full-screen enlarge mode. */
export const DocumentReaderPanel: React.FC<DocumentReaderPanelProps> = ({
  label,
  title,
  subtitle,
  meta,
  pdfUrl,
  pdfTitle,
  onClose,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [zoom, setZoom] = useState(ZOOM_MIN);

  useEffect(() => {
    setIsMaximized(false);
    setZoom(ZOOM_MIN);
  }, [pdfUrl]);

  useEffect(() => {
    if (!isMaximized) {
      setZoom(ZOOM_MIN);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMaximized(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMaximized]);

  const exitMaximize = () => setIsMaximized(false);

  const handleClose = () => {
    setIsMaximized(false);
    setZoom(ZOOM_MIN);
    onClose();
  };

  const zoomOut = () => setZoom((value) => Math.max(ZOOM_MIN, Math.round((value - ZOOM_STEP) * 100) / 100));
  const zoomIn = () => setZoom((value) => Math.min(ZOOM_MAX, Math.round((value + ZOOM_STEP) * 100) / 100));

  const headerButtons = (
    <div className="flex items-center gap-1.5 shrink-0">
      {isMaximized && (
        <>
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= ZOOM_MIN}
            className="inline-flex items-center justify-center p-2 text-neutral hover:text-charcoal border border-gray-200 rounded-[4px] hover:bg-gray-50 min-h-[44px] min-w-[44px] disabled:opacity-40"
            aria-label="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= ZOOM_MAX}
            className="inline-flex items-center justify-center p-2 text-neutral hover:text-charcoal border border-gray-200 rounded-[4px] hover:bg-gray-50 min-h-[44px] min-w-[44px] disabled:opacity-40"
            aria-label="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </>
      )}
      <button
        type="button"
        onClick={() => (isMaximized ? exitMaximize() : setIsMaximized(true))}
        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold rounded-[4px] min-h-[44px] ${
          isMaximized
            ? 'text-neutral hover:text-charcoal border border-gray-200 hover:bg-gray-50'
            : 'bg-charcoal text-white hover:bg-gold hover:text-charcoal'
        }`}
        aria-pressed={isMaximized}
        aria-label={isMaximized ? 'Exit enlarged view' : 'Enlarge PDF for easier reading'}
      >
        {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        <span>{isMaximized ? 'Exit' : 'Enlarge'}</span>
      </button>
      <button
        type="button"
        onClick={handleClose}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-neutral hover:text-charcoal border border-gray-200 rounded-[4px] hover:bg-gray-50 min-h-[44px]"
      >
        <X size={16} />
        Close
      </button>
    </div>
  );

  const panel = (
    <div
      className={
        isMaximized
          ? 'fixed inset-0 z-[110] flex flex-col bg-white'
          : 'space-y-3 -mx-1 sm:mx-0'
      }
      style={
        isMaximized
          ? {
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }
          : undefined
      }
    >
      <div
        className={
          isMaximized
            ? 'shrink-0 flex items-start justify-between gap-3 border-b border-gray-200 bg-white px-3 py-2.5 shadow-sm'
            : 'sticky top-0 z-10 flex items-start justify-between gap-3 rounded-[4px] border border-gray-200 bg-white p-3 sm:p-4 shadow-sm'
        }
      >
        <div className="min-w-0 flex-1 text-charcoal">
          <h3 className="font-bold uppercase tracking-widest text-[10px] sm:text-xs text-[#222222]">{label}</h3>
          <p
            className={`text-lg font-sans font-semibold text-[#222222] leading-snug ${
              isMaximized ? 'truncate' : 'break-words'
            }`}
          >
            {title}
          </p>
          {!isMaximized && subtitle && (
            <p className="text-base font-sans text-[#444444] break-words leading-snug mt-0.5">{subtitle}</p>
          )}
          {!isMaximized && meta && <p className="text-xs sm:text-sm text-neutral mt-0.5">{meta}</p>}
        </div>
        {headerButtons}
      </div>
      <div className={isMaximized ? 'flex-1 min-h-0 px-0' : undefined}>
        <EmbeddedPdfViewer
          key={pdfUrl}
          src={pdfUrl}
          title={pdfTitle}
          fillHeight={isMaximized}
          zoom={isMaximized ? zoom : 1}
          className={isMaximized ? 'h-full rounded-none border-0' : undefined}
        />
      </div>
    </div>
  );

  if (isMaximized && typeof document !== 'undefined') {
    return createPortal(panel, document.body);
  }

  return panel;
};
