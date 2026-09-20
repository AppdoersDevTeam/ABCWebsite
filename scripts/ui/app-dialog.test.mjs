import assert from 'node:assert/strict';
import { test } from 'node:test';
import { appAlert, appConfirm, registerAppDialogHost } from '../../lib/appDialog.ts';

test('appAlert and appConfirm wait for the host instead of closing on outside click', async () => {
  let queued = 0;
  registerAppDialogHost({
    enqueue: (request) => {
      queued += 1;
      if (request.kind === 'alert') request.resolveAlert?.();
      if (request.kind === 'confirm') request.resolveConfirm?.(true);
    },
  });

  await appAlert('Centered message');
  const confirmed = await appConfirm('Keep this box until OK');
  assert.equal(queued, 2);
  assert.equal(confirmed, true);

  registerAppDialogHost(null);
});

test('appConfirm forwards professional labels to the host', async () => {
  /** @type {import('../../lib/appDialog.ts').AppDialogRequest | null} */
  let seen = null;
  registerAppDialogHost({
    enqueue: (request) => {
      seen = request;
      request.resolveConfirm?.(false);
    },
  });

  const confirmed = await appConfirm('Please confirm you want to remove this photo.', {
    confirmLabel: 'Delete',
    cancelLabel: 'Keep',
  });
  assert.equal(confirmed, false);
  assert.equal(seen?.kind, 'confirm');
  assert.equal(seen?.confirmLabel, 'Delete');
  assert.equal(seen?.cancelLabel, 'Keep');

  registerAppDialogHost(null);
});
