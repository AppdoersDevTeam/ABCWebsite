/**
 * Returns true if at least `minMs` has elapsed since the last successful gate.
 * Used to debounce focus/visibility refetches without changing UI behaviour.
 */
export function allowAfterInterval(
  lastAtRef: { current: number },
  minMs: number,
  now = Date.now()
): boolean {
  if (now - lastAtRef.current < minMs) return false;
  lastAtRef.current = now;
  return true;
}
