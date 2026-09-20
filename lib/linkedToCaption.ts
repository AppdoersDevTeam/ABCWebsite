export function linkedToCaption(name: string | null | undefined): string {
  const trimmed = (name || '').trim();
  return trimmed ? `Linked to ${trimmed}` : 'Linked';
}
