export function readFormDraft<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeFormDraft<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sessionStorage may be unavailable in private mode — ignore
  }
}

export function clearFormDraft(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const ADMIN_DRAFT_KEYS = {
  devotionalUpload: 'abc-admin-devotional-upload-draft',
  devotionalEdit: 'abc-admin-devotional-edit-draft',
  newsletterUpload: 'abc-admin-newsletter-upload-draft',
  newsletterEdit: 'abc-admin-newsletter-edit-draft',
} as const;

export interface DevotionalUploadDraft {
  open: boolean;
  title: string;
  subtitle: string;
  weekDate: string;
  fileName?: string;
}

export interface DevotionalEditDraft {
  open: boolean;
  id: string;
  title: string;
  subtitle: string;
  weekDate: string;
  fileName?: string;
}

export interface NewsletterUploadDraft {
  open: boolean;
  month: string;
  year: string;
  description: string;
  fileName?: string;
}

export interface NewsletterEditDraft {
  open: boolean;
  id: string;
  month: string;
  year: string;
  fileName?: string;
}
