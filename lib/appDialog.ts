export type AppDialogKind = 'alert' | 'confirm';

export type AppDialogOptions = {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export type AppDialogRequest = {
  kind: AppDialogKind;
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  resolveAlert?: () => void;
  resolveConfirm?: (value: boolean) => void;
};

type AppDialogHostApi = {
  enqueue: (request: AppDialogRequest) => void;
};

let host: AppDialogHostApi | null = null;

export function registerAppDialogHost(next: AppDialogHostApi | null): void {
  host = next;
}

function fallbackAlert(message: string): void {
  window.alert(message);
}

function fallbackConfirm(message: string): boolean {
  return window.confirm(message);
}

export function appAlert(message: string, options: AppDialogOptions = {}): Promise<void> {
  if (!host) {
    fallbackAlert(message);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    host?.enqueue({
      kind: 'alert',
      message,
      title: options.title,
      confirmLabel: options.confirmLabel,
      resolveAlert: resolve,
    });
  });
}

export function appConfirm(message: string, options: AppDialogOptions = {}): Promise<boolean> {
  if (!host) {
    return Promise.resolve(fallbackConfirm(message));
  }
  return new Promise((resolve) => {
    host?.enqueue({
      kind: 'confirm',
      message,
      title: options.title,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      resolveConfirm: resolve,
    });
  });
}
