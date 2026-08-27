import React from 'react';
import { X } from 'lucide-react';
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

/** Mobile-friendly in-page PDF reader with sticky header. */
export const DocumentReaderPanel: React.FC<DocumentReaderPanelProps> = ({
  label,
  title,
  subtitle,
  meta,
  pdfUrl,
  pdfTitle,
  onClose,
}) => {
  return (
    <div className="space-y-3 -mx-1 sm:mx-0">
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 rounded-[4px] border border-gray-200 bg-white/95 backdrop-blur-sm p-3 sm:p-4 shadow-sm">
        <div className="min-w-0 flex-1">
          <h3 className="text-charcoal font-bold uppercase tracking-widest text-[10px] sm:text-xs">{label}</h3>
          <p className="text-base sm:text-lg font-serif text-charcoal break-words">{title}</p>
          {subtitle && (
            <p className="text-sm sm:text-base font-serif text-charcoal/80 break-words">{subtitle}</p>
          )}
          {meta && <p className="text-xs sm:text-sm text-neutral mt-0.5">{meta}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-neutral hover:text-charcoal border border-gray-200 rounded-[4px] hover:bg-gray-50 min-h-[44px]"
        >
          <X size={16} />
          Close
        </button>
      </div>
      <EmbeddedPdfViewer key={pdfUrl} src={pdfUrl} title={pdfTitle} />
    </div>
  );
};
