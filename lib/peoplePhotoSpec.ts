/** People directory photo upload limits (Admin → People). */
export const PEOPLE_PHOTO = {
  maxFileBytes: 1024 * 1024,
  sizeLabel: '1024KB',
  allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'] as const,
  uploadHint: 'PNG, JPEG, or PDF (max 1024KB)',
  tooLargeMessage: 'Please choose a file smaller than 1024KB.',
  invalidTypeMessage: 'Please choose a PNG, JPEG, or PDF file.',
} as const;

export function isPeoplePhotoTypeAllowed(mimeType: string): boolean {
  return (PEOPLE_PHOTO.allowedTypes as readonly string[]).includes(mimeType);
}

export function isPeoplePhotoWithinLimit(fileSizeBytes: number): boolean {
  return fileSizeBytes <= PEOPLE_PHOTO.maxFileBytes;
}
