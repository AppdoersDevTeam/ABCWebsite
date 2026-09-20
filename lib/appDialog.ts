export type AppDialogKind = 'alert' | 'confirm';

export type AppDialogRequest = {
  kind: AppDialogKind;
  message: string;
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

export function appAlert(message: string): Promise<void> {
  if (!host) {
    fallbackAlert(message);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    host?.enqueue({
      kind: 'alert',
      message,
      resolveAlert: resolve,
    });
  });
}

export function appConfirm(message: string): Promise<boolean> {
  if (!host) {
    return Promise.resolve(fallbackConfirm(message));
  }
  return new Promise((resolve) => {
    host?.enqueue({
      kind: 'confirm',
      message,
      resolveConfirm: resolve,
    });
  });
}
