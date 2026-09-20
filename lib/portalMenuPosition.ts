export type RectBox = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export function portalMenuPosition(
  trigger: RectBox,
  menuSize: { width: number; height: number },
  viewport: { width: number; height: number },
  gap = 4,
  padding = 8,
): { top: number; left: number } {
  let left = trigger.right - menuSize.width;
  if (left < padding) left = padding;
  if (left + menuSize.width > viewport.width - padding) {
    left = Math.max(padding, viewport.width - menuSize.width - padding);
  }

  const below = trigger.bottom + gap;
  const above = trigger.top - menuSize.height - gap;
  const fitsBelow = below + menuSize.height <= viewport.height - padding;
  const top = fitsBelow || above < padding ? below : above;
  return { top, left };
}
