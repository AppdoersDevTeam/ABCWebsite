/** Canonical event banner spec — one size fits every event image slot on the site. */
export const EVENT_IMAGE = {
  width: 1920,
  height: 1080,
  aspectRatio: 16 / 9,
  aspectClass: 'aspect-[16/9]',
  ratioLabel: '16:9',
  sizeLabel: '1920 × 1080 px',
  maxFileBytes: 5 * 1024 * 1024,
  minWidth: 1280,
  uploadHint:
    'Use one image at 1920 × 1080 px (16:9 ratio). JPG or PNG, max 5MB. This same file fits the event page, calendar, and listings.',
} as const;

const RATIO_TOLERANCE = 0.02;

export function checkEventImageDimensions(
  width: number,
  height: number
): { ok: true } | { ok: false; message: string } {
  if (!width || !height) {
    return { ok: false, message: 'Could not read image dimensions.' };
  }

  const ratio = width / height;
  if (Math.abs(ratio - EVENT_IMAGE.aspectRatio) > RATIO_TOLERANCE) {
    return {
      ok: false,
      message: `Image must be ${EVENT_IMAGE.ratioLabel} (${EVENT_IMAGE.sizeLabel}). Yours is ${width} × ${height} px — resize before uploading.`,
    };
  }

  if (width < EVENT_IMAGE.minWidth) {
    return {
      ok: false,
      message: `Image is too small (${width} × ${height} px). Use at least ${EVENT_IMAGE.sizeLabel} for sharp display.`,
    };
  }

  return { ok: true };
}

export function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}
