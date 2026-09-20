import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  /** When false, only the X button (or explicit Cancel in content) closes the modal. Default false. */
  closeOnBackdropClick?: boolean;
  /** Block close via backdrop or X (e.g. while uploading). */
  preventClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  closeOnBackdropClick = false,
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
      }, 2000);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') armSuppress();
      else onFocus();
    };

    window.addEventListener('blur', armSuppress);
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('blur', armSuppress);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearTimeout(focusTimerRef.current);
    };
  }, [isOpen]);

  const requestClose = useCallback(() => {
    if (preventClose) return;
    onClose();
  }, [onClose, preventClose]);

  const shouldIgnoreBackdrop = () =>
    !closeOnBackdropClick || preventClose || suppressBackdropCloseRef.current;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (shouldIgnoreBackdrop()) return;
    onClose();
  };

  const handleBackdropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (!shouldIgnoreBackdrop()) return;
    event.preventDefault();
    event.stopPropagation();
  };

  if (!isOpen) return null;

  // Portal to body so z-index is not trapped under layout <main z-10> (below fixed header z-50).
  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm transition-opacity duration-300 md:items-center md:p-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
      style={{ opacity: isOpen ? 1 : 0 }}
      onClick={handleBackdropClick}
      onPointerDown={handleBackdropPointerDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative min-w-0 w-full max-w-2xl overflow-y-auto bg-white shadow-2xl max-md:max-h-[100vh] max-md:max-h-[100dvh] max-md:rounded-t-[16px] md:max-h-[90vh] md:max-h-[90dvh] md:rounded-[16px]"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
            <h2 className="min-w-0 break-words text-2xl font-serif font-normal text-charcoal">{title}</h2>
            <button
              type="button"
              onClick={requestClose}
              disabled={preventClose}
              aria-label="Close"
              className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full p-2 text-neutral transition-colors hover:bg-gray-100 hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
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
            aria-label="Close"
            className="absolute right-4 top-4 z-10 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-neutral transition-colors hover:bg-gray-100 hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={24} />
          </button>
        )}
        <div className="min-w-0 p-4 sm:p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};
