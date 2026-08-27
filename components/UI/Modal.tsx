import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  /** When false, only the X button (or explicit Cancel in content) closes the modal. Default true. */
  closeOnBackdropClick?: boolean;
  /** Block close via backdrop or X (e.g. while uploading). */
  preventClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  closeOnBackdropClick = true,
  preventClose = false,
}) => {
  const suppressBackdropCloseRef = useRef(false);
  const focusTimerRef = useRef<number>();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Ignore ghost clicks on the backdrop after tab switch or native file picker.
  useEffect(() => {
    if (!isOpen) return;

    const armSuppress = () => {
      suppressBackdropCloseRef.current = true;
    };

    const onFocus = () => {
      window.clearTimeout(focusTimerRef.current);
      suppressBackdropCloseRef.current = true;
      focusTimerRef.current = window.setTimeout(() => {
        suppressBackdropCloseRef.current = false;
      }, 400);
    };

    window.addEventListener('blur', armSuppress);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') armSuppress();
      else onFocus();
    });

    return () => {
      window.removeEventListener('blur', armSuppress);
      window.removeEventListener('focus', onFocus);
      window.clearTimeout(focusTimerRef.current);
    };
  }, [isOpen]);

  const requestClose = useCallback(() => {
    if (preventClose) return;
    onClose();
  }, [onClose, preventClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (!closeOnBackdropClick || preventClose || suppressBackdropCloseRef.current) return;
    onClose();
  };

  if (!isOpen) return null;

  // Portal to body so z-index is not trapped under layout <main z-10> (below fixed header z-50).
  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      style={{ opacity: isOpen ? 1 : 0 }}
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-[16px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative transition-all duration-300"
        style={{
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          opacity: isOpen ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-serif font-normal text-charcoal">{title}</h2>
            <button
              type="button"
              onClick={requestClose}
              disabled={preventClose}
              className="text-neutral hover:text-charcoal transition-colors p-2 hover:bg-gray-100 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X size={24} />
            </button>
          </div>
        )}
        {!title && (
          <button
            type="button"
            onClick={requestClose}
            disabled={preventClose}
            className="absolute top-4 right-4 text-neutral hover:text-charcoal transition-colors p-2 hover:bg-gray-100 rounded-full z-10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X size={24} />
          </button>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};
