import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

export type TurnstileFieldHandle = {
  reset: () => void;
};

type TurnstileFieldProps = {
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
};

export const TurnstileField = forwardRef<TurnstileFieldHandle, TurnstileFieldProps>(
  function TurnstileField({ onToken, onExpire, onError, className }, ref) {
    const widgetRef = useRef<TurnstileInstance | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        widgetRef.current?.reset();
      },
    }));

    if (!SITE_KEY) {
      return (
        <p className="text-xs text-red-600 px-1">
          CAPTCHA is not configured (missing VITE_TURNSTILE_SITE_KEY).
        </p>
      );
    }

    return (
      <div className={className}>
        <Turnstile
          ref={widgetRef}
          siteKey={SITE_KEY}
          options={{ theme: 'light', size: 'flexible' }}
          onSuccess={onToken}
          onExpire={() => {
            onExpire?.();
          }}
          onError={() => {
            onError?.();
          }}
        />
      </div>
    );
  }
);
