import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { registerAppDialogHost, type AppDialogRequest } from '../../lib/appDialog';

export const AppDialogHost: React.FC = () => {
  const [queue, setQueue] = useState<AppDialogRequest[]>([]);
  const current = queue[0] || null;

  const enqueue = useCallback((request: AppDialogRequest) => {
    setQueue((existing) => [...existing, request]);
  }, []);

  useEffect(() => {
    registerAppDialogHost({ enqueue });
    const originalAlert = window.alert.bind(window);
    window.alert = (message?: string) => {
      enqueue({
        kind: 'alert',
        message: message == null ? '' : String(message),
        resolveAlert: () => undefined,
      });
    };
    return () => {
      window.alert = originalAlert;
      registerAppDialogHost(null);
    };
  }, [enqueue]);

  const finishAlert = () => {
    current?.resolveAlert?.();
    setQueue((existing) => existing.slice(1));
  };

  const finishConfirm = (value: boolean) => {
    current?.resolveConfirm?.(value);
    setQueue((existing) => existing.slice(1));
  };

  if (!current || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-describedby="abc-app-dialog-message"
        className="relative w-full max-w-lg rounded-[16px] bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <p id="abc-app-dialog-message" className="whitespace-pre-wrap text-base leading-relaxed text-charcoal">
          {current.message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          {current.kind === 'confirm' ? (
            <>
              <button
                type="button"
                className="rounded-[8px] border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-neutral hover:bg-gray-50"
                onClick={() => finishConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-[8px] bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold/90"
                onClick={() => finishConfirm(true)}
              >
                OK
              </button>
            </>
          ) : (
            <button
              type="button"
              className="rounded-[8px] bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold/90"
              onClick={finishAlert}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
