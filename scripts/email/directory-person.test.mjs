import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildDirectoryPersonEmailHtml,
  buildDirectoryPersonEmailText,
  directoryPersonEmailSubject,
  firstNameFromDirectoryName,
} from '../../supabase/functions/notify-directory-person/directoryPersonEmail.ts';

test('directory added email is a professional confirmation', () => {
  const html = buildDirectoryPersonEmailHtml('added', 'Mere');
  assert.match(html, /Kia ora Mere/);
  assert.match(html, /added to the Ashburton Baptist Church People directory/);
  assert.match(html, /office@ashburtonbaptist\.co\.nz/);
  assert.match(directoryPersonEmailSubject('added'), /added to the Ashburton Baptist Church directory/);
  const text = buildDirectoryPersonEmailText('added', 'Mere');
  assert.match(text, /Kia ora Mere/);
  assert.match(text, /People directory/);
});

test('directory archived and deleted emails explain the action', () => {
  const archived = buildDirectoryPersonEmailHtml('archived', 'James');
  assert.match(archived, /Kia ora James/);
  assert.match(archived, /has been archived/);
  assert.match(archived, /no longer shown on public pages/);
  assert.match(directoryPersonEmailSubject('archived'), /archived/);

  const deleted = buildDirectoryPersonEmailHtml('deleted', 'Ana');
  assert.match(deleted, /Kia ora Ana/);
  assert.match(deleted, /permanently removed/);
  assert.match(deleted, /cannot be undone/);
  assert.match(directoryPersonEmailSubject('deleted'), /removed/);
});

test('directory first name falls back when the name is empty', () => {
  assert.equal(firstNameFromDirectoryName('Sarah Jones'), 'Sarah');
  assert.equal(firstNameFromDirectoryName('  '), 'there');
});
