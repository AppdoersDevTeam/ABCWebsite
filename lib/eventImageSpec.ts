/** Display spec for event image slots (cards use 16:9 crop; detail page shows full photo). */
export const EVENT_IMAGE = {
  width: 1920,
  height: 1080,
  aspectRatio: 16 / 9,
  aspectClass: 'aspect-[16/9]',
  ratioLabel: '16:9',
  sizeLabel: '1920 × 1080 px',
  maxFileBytes: 5 * 1024 * 1024,
  uploadHint:
    'Upload any photo. Landscape looks best in listings. JPG or PNG, max 5MB. Shown cropped in cards; full photo on the event page.',
} as const;

export function checkEventImageDimensions(
  width: number,
  height: number
): { ok: true } | { ok: false; message: string } {
  if (!width || !height) {
    return { ok: false, message: 'Could not read image dimensions.' };
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
