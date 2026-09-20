import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  comparePortalNavLabels,
  portalNavNeedsDivider,
  sortPortalNavItems,
} from '../../lib/dashboardNav.ts';

test('admin left menu keeps Overview first then A–Z including Changelog and Users & Roles children', () => {
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
      'Overview',
      'Annual Calendar',
      'Changelog',
      'Devotionals',
      'Events',
      'Help',
      'Logs',
      'Newsletters',
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

test('member left menu keeps Overview first then A–Z', () => {
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
      'Overview',
      'Annual Calendar',
      'Devotionals',
      'Events',
      'Help',
      'Newsletters',
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

test('a divider is shown after Overview when it is first', () => {
  const items = [{ label: 'Overview' }, { label: 'Annual Calendar' }, { label: 'Events' }];
  assert.equal(portalNavNeedsDivider(0, items), false);
  assert.equal(portalNavNeedsDivider(1, items), true);
  assert.equal(portalNavNeedsDivider(2, items), false);
  assert.equal(portalNavNeedsDivider(1, [{ label: 'Events' }, { label: 'Help' }]), false);
});
