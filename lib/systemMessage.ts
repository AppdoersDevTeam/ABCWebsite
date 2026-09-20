export type SystemDialogKind = 'alert' | 'confirm';

export function withSystemDetail(message: string, detail?: string | null): string {
  const extra = (detail || '').trim();
  if (!extra) return message;
  return `${message}\n\n${extra}`;
}

export function errorDetail(detail?: unknown): string | undefined {
  if (detail instanceof Error && detail.message.trim()) return detail.message;
  if (typeof detail === 'string' && detail.trim()) return detail;
  return undefined;
}

export function namedPerson(name?: string | null, fallback = 'this person'): string {
  const trimmed = (name || '').trim();
  return trimmed || fallback;
}

export function inferDialogTitle(kind: SystemDialogKind, message: string, explicit?: string): string {
  if (explicit?.trim()) return explicit.trim();
  if (kind === 'confirm') return 'Please confirm';

  const text = (message || '').toLowerCase();
  if (/(could not|was not|were not|failed|unable to|something went wrong|\berror\b)/.test(text)) {
    return 'Something went wrong';
  }
  if (/(please (enter|select|choose|complete|fill|upload|log in|provide)|photo is required|is required)/.test(text)) {
    return 'A few details are needed';
  }
  if (
    /(has been|have been|was added|was sent|is now|is approved|created|updated|uploaded|approved|restored|removed|deleted from|linked )/
      .test(text)
  ) {
    return 'Done';
  }
  return 'Notice';
}

export function cannotLoad(thing: string, detail?: string | null): string {
  return withSystemDetail(`We could not load ${thing} just now. Please refresh the page and try again.`, detail);
}

export function cannotSave(thing: string, detail?: string | null): string {
  return withSystemDetail(`We could not save ${thing}. Please check the details and try again.`, detail);
}

export function cannotDelete(thing: string, detail?: string | null): string {
  return withSystemDetail(`We could not delete ${thing}. Please try again.`, detail);
}

export function cannotComplete(action: string, detail?: string | null): string {
  return withSystemDetail(`We could not ${action}. Please try again.`, detail);
}

export function confirmPermanent(action: string): string {
  return `${action} This cannot be undone.`;
}

export function pleaseCompleteRequired(): string {
  return 'Please complete the required fields before continuing.';
}

export function pleaseChooseFile(kind = 'file'): string {
  return `Please choose a ${kind} before continuing.`;
}
