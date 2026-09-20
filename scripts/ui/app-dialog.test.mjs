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
