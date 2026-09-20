import assert from 'node:assert/strict';
import { test } from 'node:test';
import { comparePortalNavLabels, sortPortalNavItems } from '../../lib/dashboardNav.ts';

test('admin left menu sorts A–Z including Changelog and Users & Roles children', () => {
  const sorted = sortPortalNavItems([
    { label: 'Overview' },
    { label: 'Annual Calendar' },
    {
      label: 'Users & Roles',
      children: [
        { label: 'Users' },
        { label: 'Roles & Permissions' },
      ],
    },
    { label: 'Prayers' },
    { label: 'Newsletters' },
    { label: 'Devotionals' },
    { label: 'People' },
    { label: 'Events' },
    { label: 'Rosters (Beta)' },
    { label: 'System Setup' },
    { label: 'Help' },
    { label: 'Logs' },
    { label: 'Changelog' },
  ]);

  assert.deepEqual(
    sorted.map((item) => item.label),
    [
      'Annual Calendar',
      'Changelog',
      'Devotionals',
      'Events',
      'Help',
      'Logs',
      'Newsletters',
      'Overview',
      'People',
      'Prayers',
      'Rosters (Beta)',
      'System Setup',
      'Users & Roles',
    ],
  );

  const usersRoles = sorted.find((item) => item.label === 'Users & Roles');
  assert.deepEqual(
    usersRoles?.children?.map((child) => child.label),
    ['Roles & Permissions', 'Users'],
  );
});

test('member left menu sorts A–Z', () => {
  const sorted = sortPortalNavItems([
    { label: 'Overview' },
    { label: 'Annual Calendar' },
    { label: 'Prayers' },
    { label: 'Newsletters' },
    { label: 'Devotionals' },
    { label: 'Sermons' },
    { label: 'People' },
    { label: 'Events' },
    { label: 'Rosters (Beta)' },
    { label: 'Help' },
  ]);

  assert.deepEqual(
    sorted.map((item) => item.label),
    [
      'Annual Calendar',
      'Devotionals',
      'Events',
      'Help',
      'Newsletters',
      'Overview',
      'People',
      'Prayers',
      'Rosters (Beta)',
      'Sermons',
    ],
  );
});

test('nav labels compare case-insensitively', () => {
  assert.ok(comparePortalNavLabels('events', 'Help') < 0);
  assert.equal(comparePortalNavLabels('People', 'people'), 0);
});
