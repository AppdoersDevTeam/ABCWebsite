/** Web Push VAPID public key. Safe to expose in the browser. Private key lives in Edge Function secrets. */
export const VAPID_PUBLIC_KEY =
  (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined)?.trim() ||
  'BBoZC5upugKSwv08SAjPqhdZmXlG_DKjAoxodpTncJidgoIXW_aSl1KrTh6E542sywgkqfXtwwEWslIQBBINXEU';
